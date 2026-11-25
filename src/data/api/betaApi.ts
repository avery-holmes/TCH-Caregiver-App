import type { CaregiverAccount, ChildDetails, ChildProfile } from "@/domain/childProfile";

export class BetaApiError extends Error {
  constructor(public readonly status: number) {
    super(status === 401 ? "Your session ended. Sign in again."
      : status === 403 ? "The request could not be verified. Please try again."
      : status === 409 ? "These details already exist or the profile changed. Reload before trying again."
      : status === 413 ? "Choose a JPEG or PNG photo smaller than 3 MB."
      : status === 429 ? "Too many sign-in attempts. Please wait 15 minutes."
      : status === 400 ? "Check the entered details. Photos must be JPEG or PNG, under 3 MB and 8 megapixels."
      : "The service could not complete this request. Please try again.");
  }
}

/** Session cookies are managed by the HTTP client; no credentials go into AsyncStorage. */
export class BetaApi {
  private readonly baseUrl: string;
  constructor(baseUrl = process.env.EXPO_PUBLIC_BETA_API_URL || "http://localhost:8090",
    private readonly send: typeof fetch = (input, init) => fetch(input, init)) {
    const url = new URL(baseUrl);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      !(url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))) {
      throw new Error("The beta service requires HTTPS or a loopback development address.");
    }
    this.baseUrl = url.origin;
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const headers = new Headers(init.headers);
      if (init.method && init.method !== "GET") {
        const csrf = await this.send(`${this.baseUrl}/api/session/csrf`, {
          credentials: "include", cache: "no-store", signal: controller.signal,
        });
        if (!csrf.ok) throw new BetaApiError(csrf.status);
        const token = await csrf.json() as { headerName: string; token: string };
        if (token.headerName !== "X-CSRF-TOKEN" || !token.token) throw new Error("Invalid session response");
        headers.set(token.headerName, token.token);
      }
      const response = await this.send(`${this.baseUrl}${path}`, {
        ...init, headers, credentials: "include", cache: "no-store", signal: controller.signal,
      });
      if (!response.ok) throw new BetaApiError(response.status);
      return response;
    } catch (error) {
      if (error instanceof BetaApiError) throw error;
      throw new Error("Cannot reach the beta service. Check that it is running and try again.");
    } finally { clearTimeout(timeout); }
  }

  async me(): Promise<CaregiverAccount | null> {
    try { return await (await this.request("/api/session/me")).json(); }
    catch (error) { if (error instanceof BetaApiError && error.status === 401) return null; throw error; }
  }

  async register(email: string, displayName: string, password: string): Promise<void> {
    await this.request("/api/session/register", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), displayName: displayName.trim(), password }) });
  }

  async login(email: string, password: string): Promise<CaregiverAccount> {
    const body = new URLSearchParams({ email: email.trim(), password }).toString();
    return (await this.request("/api/session/login", { method: "POST", headers: {
      "Content-Type": "application/x-www-form-urlencoded" }, body })).json();
  }

  async logout(): Promise<void> { await this.request("/api/session/logout", { method: "POST" }); }
  async children(): Promise<ChildProfile[]> { return (await this.request("/api/children")).json(); }

  async saveChild(details: ChildDetails, existing?: ChildProfile): Promise<ChildProfile> {
    const path = existing ? `/api/children/${encodeURIComponent(existing.id)}` : "/api/children";
    return (await this.request(path, { method: existing ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(existing ? { details, revision: existing.revision } : details) })).json();
  }

  async photo(id: string): Promise<Blob> {
    return (await this.request(`/api/children/${encodeURIComponent(id)}/photo`)).blob();
  }

  async uploadPhoto(id: string, photo: FormData): Promise<void> {
    await this.request(`/api/children/${encodeURIComponent(id)}/photo`, { method: "PUT", body: photo });
  }

  async removePhoto(id: string): Promise<void> {
    await this.request(`/api/children/${encodeURIComponent(id)}/photo`, { method: "DELETE" });
  }
}
