import { createEpicSandboxClient, type AuthorizedSandboxSession } from "./epicSandboxClient";
import sandbox from "./sandboxConfig.json";

const timestamp = Date.UTC(2026, 9, 21, 12);
const session: AuthorizedSandboxSession = {
  fhirBaseUrl: sandbox.fhirBaseUrl,
  patientId: "synthetic-patient-1",
  accessToken: "synthetic-token-not-a-credential",
  expiresAt: timestamp + 60000,
  grantedScopes: ["patient/Patient.read"],
};
const metadata = {
  authorization_endpoint: sandbox.authorizationEndpoint,
  token_endpoint: sandbox.tokenEndpoint,
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code"],
  capabilities: ["launch-standalone"],
  code_challenge_methods_supported: ["S256"],
};

function response(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

const transport = jest.fn<Promise<ReturnType<typeof response>>, [string, RequestInit]>();
const client = createEpicSandboxClient(transport, () => timestamp);

beforeEach(() => transport.mockReset());

test("discovers the sandbox without sending a credential", async () => {
  transport.mockResolvedValue(response(metadata));
  await expect(client.discover()).resolves.toMatchObject({ supportsPkceS256: true, supportsStandaloneLaunch: true });
  expect(transport).toHaveBeenCalledWith(
    `${sandbox.fhirBaseUrl}.well-known/smart-configuration`,
    expect.objectContaining({ method: "GET", redirect: "error", credentials: "omit" })
  );
  expect(transport.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
});

test.each([
  null,
  { ...metadata, token_endpoint: "https://example.invalid/token" },
  { ...metadata, authorization_endpoint: "https://example.invalid/authorize" },
  { ...metadata, code_challenge_methods_supported: ["plain"] },
  { ...metadata, capabilities: [] },
  { ...metadata, grant_types_supported: ["client_credentials"] },
])("rejects unsupported or redirected authorization metadata: %p", async (data) => {
  transport.mockResolvedValue(response(data));
  await expect(client.discover()).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
});

test("reads only the session's patient and preserves external source attribution", async () => {
  transport.mockResolvedValue(response({
    resourceType: "Patient", id: session.patientId,
    name: [{ use: "official", given: ["Synthetic"], family: "Example" }],
  }));
  await expect(client.readAuthorizedPatient(session)).resolves.toEqual({
    displayName: "Synthetic Example",
    source: {
      environment: "epic-sandbox", fhirBaseUrl: sandbox.fhirBaseUrl,
      resourceType: "Patient", resourceId: session.patientId,
      retrievedAt: "2026-10-21T12:00:00.000Z",
    },
  });
  expect(transport).toHaveBeenCalledWith(`${sandbox.fhirBaseUrl}Patient/${session.patientId}`,
    expect.objectContaining({ method: "GET", headers: expect.objectContaining({ Authorization: `Bearer ${session.accessToken}` }) }));
});

test.each([
  { ...session, fhirBaseUrl: "https://example.invalid/production/FHIR/R4/" },
  { ...session, patientId: "../Patient/another" },
  { ...session, patientId: "https://example.invalid/patient" },
  { ...session, accessToken: "" },
  { ...session, accessToken: "invalid\r\nheader" },
  { ...session, expiresAt: timestamp },
  { ...session, expiresAt: NaN },
  { ...session, grantedScopes: ["patient/Patient.s"] },
  { ...session, grantedScopes: ["patient/Patient.write"] },
])("rejects an invalid or insufficient session before any request: %p", async (invalid) => {
  await expect(client.readAuthorizedPatient(invalid)).rejects.toMatchObject({ code: "INVALID_SESSION" });
  expect(transport).not.toHaveBeenCalled();
});

test.each(["patient/Patient.r", "patient/Patient.rs"])("accepts a SMART v2 patient-read scope: %s", async (scope) => {
  transport.mockResolvedValue(response({ resourceType: "Patient", id: session.patientId }));
  await expect(client.readAuthorizedPatient({ ...session, grantedScopes: [scope] })).resolves.toMatchObject({ displayName: null });
});

test.each([
  { resourceType: "Patient", id: "another-patient" },
  { resourceType: "Observation", id: session.patientId },
  { resourceType: "OperationOutcome", issue: [{ diagnostics: "Synthetic server detail" }] },
  null,
])("rejects wrong-patient or wrong-resource responses: %p", async (body) => {
  transport.mockResolvedValue(response(body));
  await expect(client.readAuthorizedPatient(session)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
});

test.each([[401, "UNAUTHORIZED"], [403, "FORBIDDEN"], [429, "RATE_LIMITED"], [500, "HTTP_ERROR"]])(
  "reports HTTP %i without exposing server diagnostics", async (status, code) => {
    transport.mockResolvedValue(response({ sensitive: "synthetic-private-diagnostics" }, status as number));
    await expect(client.readAuthorizedPatient(session)).rejects.toMatchObject({ code });
    await expect(client.readAuthorizedPatient(session)).rejects.not.toThrow("synthetic-private-diagnostics");
  }
);

test("does not echo transport errors containing credentials", async () => {
  transport.mockRejectedValue(new Error(`Request failed: ${session.accessToken}`));
  await expect(client.readAuthorizedPatient(session)).rejects.toMatchObject({ code: "NETWORK" });
  await expect(client.readAuthorizedPatient(session)).rejects.not.toThrow(session.accessToken);
});

test("rejects a non-JSON response", async () => {
  transport.mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error("HTML response"); } });
  await expect(client.discover()).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
});

test("aborts a request that exceeds the timeout", async () => {
  jest.useFakeTimers();
  try {
    transport.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(new Error("Timed out")));
    }));
    const pending = client.discover();
    const assertion = expect(pending).rejects.toMatchObject({ code: "NETWORK" });
    await jest.advanceTimersByTimeAsync(15000);
    await assertion;
  } finally {
    jest.useRealTimers();
  }
});
