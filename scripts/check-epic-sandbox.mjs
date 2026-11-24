import sandbox from "../src/integrations/epic/sandboxConfig.json" with { type: "json" };

// Public metadata only. This command accepts no token, patient ID or production URL.
try {
  const response = await fetch(`${sandbox.fhirBaseUrl}.well-known/smart-configuration`, {
    headers: { Accept: "application/json" },
    redirect: "error",
    credentials: "omit",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Metadata request failed (HTTP ${response.status}).`);
  const metadata = await response.json();
  if (
    metadata.authorization_endpoint !== sandbox.authorizationEndpoint ||
    metadata.token_endpoint !== sandbox.tokenEndpoint ||
    !metadata.response_types_supported?.includes("code") ||
    !metadata.grant_types_supported?.includes("authorization_code") ||
    !metadata.capabilities?.includes("launch-standalone") ||
    !metadata.code_challenge_methods_supported?.includes("S256")
  ) throw new Error("Expected sandbox authorization capabilities were not advertised.");

  const capabilities = await fetch(`${sandbox.fhirBaseUrl}metadata`, {
    headers: { Accept: "application/fhir+json" },
    redirect: "error",
    credentials: "omit",
    signal: AbortSignal.timeout(15000),
  });
  if (!capabilities.ok) throw new Error(`FHIR metadata failed (HTTP ${capabilities.status}).`);
  const fhir = await capabilities.json();
  if (fhir.resourceType !== "CapabilityStatement" || fhir.fhirVersion !== "4.0.1") {
    throw new Error("Expected FHIR R4 metadata was not returned.");
  }
  console.log("Epic sandbox reachable: FHIR R4, standalone authorization-code flow, PKCE S256.");
  console.log("Public metadata check only. Patient login and authorized record retrieval remain unverified.");
} catch (error) {
  console.error(`Epic sandbox check failed: ${error instanceof Error ? error.message : "Unknown failure"}`);
  process.exitCode = 1;
}
