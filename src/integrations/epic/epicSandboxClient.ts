import sandbox from "./sandboxConfig.json";

export type EpicSandboxErrorCode =
  | "NETWORK" | "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED"
  | "HTTP_ERROR" | "INVALID_RESPONSE" | "INVALID_SESSION";

export class EpicSandboxError extends Error {
  constructor(public readonly code: EpicSandboxErrorCode, message: string) {
    super(message);
    this.name = "EpicSandboxError";
  }
}

/** Produced by a future authorized SMART flow, not by the demo profile. */
export type AuthorizedSandboxSession = {
  fhirBaseUrl: string;
  patientId: string;
  accessToken: string;
  expiresAt: number;
  grantedScopes: string[];
};

/** External records never imply a caregiver logged or administered care. */
export type ExternalPatientSummary = {
  displayName: string | null;
  source: {
    environment: "epic-sandbox";
    fhirBaseUrl: string;
    resourceType: "Patient";
    resourceId: string;
    retrievedAt: string;
  };
};

export type SandboxDiscovery = {
  fhirBaseUrl: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  supportsStandaloneLaunch: true;
  supportsPkceS256: true;
};

type JsonTransport = (url: string, init: RequestInit) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function includes(value: unknown, expected: string): boolean {
  return Array.isArray(value) && value.includes(expected);
}

/** Read-only and fixed to Epic's public sandbox. No storage or OAuth exchange. */
export function createEpicSandboxClient(
  transport: JsonTransport = (url, init) => fetch(url, init),
  now: () => number = Date.now
) {
  async function requestJson(path: string, accessToken?: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      let response: Awaited<ReturnType<JsonTransport>>;
      try {
        response = await transport(`${sandbox.fhirBaseUrl}${path}`, {
          method: "GET",
          headers: {
            Accept: "application/fhir+json, application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: "omit",
          cache: "no-store",
          redirect: "error",
          signal: controller.signal,
        });
      } catch {
        // Never include request headers, token values or server bodies in errors.
        throw new EpicSandboxError("NETWORK", "Epic sandbox could not be reached.");
      }
      if (!response.ok) {
        const code: EpicSandboxErrorCode = response.status === 401 ? "UNAUTHORIZED"
          : response.status === 403 ? "FORBIDDEN"
            : response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR";
        throw new EpicSandboxError(code, "Epic sandbox rejected the request.");
      }
      try {
        return await response.json();
      } catch {
        throw new EpicSandboxError("INVALID_RESPONSE", "Epic sandbox returned invalid JSON.");
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  async function discover(): Promise<SandboxDiscovery> {
    const metadata = await requestJson(".well-known/smart-configuration");
    if (
      !isObject(metadata) ||
      metadata.authorization_endpoint !== sandbox.authorizationEndpoint ||
      metadata.token_endpoint !== sandbox.tokenEndpoint ||
      !includes(metadata.response_types_supported, "code") ||
      !includes(metadata.grant_types_supported, "authorization_code") ||
      !includes(metadata.capabilities, "launch-standalone") ||
      !includes(metadata.code_challenge_methods_supported, "S256")
    ) {
      throw new EpicSandboxError("INVALID_RESPONSE", "Sandbox SMART configuration is unsupported.");
    }
    return {
      fhirBaseUrl: sandbox.fhirBaseUrl,
      authorizationEndpoint: sandbox.authorizationEndpoint,
      tokenEndpoint: sandbox.tokenEndpoint,
      supportsStandaloneLaunch: true,
      supportsPkceS256: true,
    };
  }

  async function readAuthorizedPatient(
    session: AuthorizedSandboxSession
  ): Promise<ExternalPatientSummary> {
    const canReadPatient = Array.isArray(session.grantedScopes) && session.grantedScopes.some(
      (scope) => ["patient/Patient.read", "patient/Patient.r", "patient/Patient.rs"].includes(scope)
    );
    if (
      session.fhirBaseUrl !== sandbox.fhirBaseUrl ||
      typeof session.patientId !== "string" || !/^[A-Za-z0-9.-]{1,64}$/.test(session.patientId) ||
      typeof session.accessToken !== "string" || !session.accessToken || /\s/.test(session.accessToken) ||
      !Number.isFinite(session.expiresAt) || session.expiresAt <= now() ||
      !canReadPatient
    ) {
      throw new EpicSandboxError("INVALID_SESSION", "An unexpired authorized patient-read session is required.");
    }
    const patient = await requestJson(`Patient/${session.patientId}`, session.accessToken);
    if (!isObject(patient) || patient.resourceType !== "Patient" || patient.id !== session.patientId) {
      throw new EpicSandboxError("INVALID_RESPONSE", "Patient response does not match the authorized patient.");
    }
    const names = Array.isArray(patient.name) ? patient.name.filter(isObject) : [];
    const selected = names.find((name) => name.use === "usual")
      ?? names.find((name) => name.use === "official") ?? names[0];
    const given = Array.isArray(selected?.given)
      ? selected.given.filter((value): value is string => typeof value === "string") : [];
    const family = typeof selected?.family === "string" ? selected.family : "";
    const text = typeof selected?.text === "string" ? selected.text.trim() : "";
    return {
      displayName: text || [...given, family].join(" ").trim() || null,
      source: {
        environment: "epic-sandbox",
        fhirBaseUrl: sandbox.fhirBaseUrl,
        resourceType: "Patient",
        resourceId: session.patientId,
        retrievedAt: new Date(now()).toISOString(),
      },
    };
  }

  return { discover, readAuthorizedPatient };
}
