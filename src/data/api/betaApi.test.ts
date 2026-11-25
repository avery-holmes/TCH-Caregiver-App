import { BetaApi, BetaApiError } from "./betaApi";

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300, status,
  json: async () => body,
}) as Response;
const csrf = () => response({ headerName: "X-CSRF-TOKEN", token: "masked-test-csrf" });
const details = { displayName: "Sample", birthDate: null, timeZone: "UTC", careSummary: "" };

test.each(["http://public.example", "https://user:pass@example.test", "https://example.test/path", "https://example.test/?secret=one"])(
  "rejects unsafe service configuration %s", (url) => { expect(() => new BetaApi(url, jest.fn())).toThrow(); });

test("uses credentialed, uncached requests and obtains CSRF before registration", async () => {
  const send = jest.fn().mockResolvedValueOnce(csrf()).mockResolvedValueOnce(response(null, 201));
  const api = new BetaApi("http://localhost:8090", send);
  await api.register(" test@example.test ", " Test ", "fictional-test-passphrase");
  expect(send.mock.calls[0][0]).toBe("http://localhost:8090/api/session/csrf");
  const [url, init] = send.mock.calls[1];
  expect(url).toBe("http://localhost:8090/api/session/register");
  expect(init.credentials).toBe("include");
  expect(init.cache).toBe("no-store");
  expect(init.headers.get("X-CSRF-TOKEN")).toBe("masked-test-csrf");
  expect(JSON.parse(init.body)).toEqual({ email: "test@example.test", displayName: "Test", password: "fictional-test-passphrase" });
});

test("refreshes CSRF for every mutation, including after login", async () => {
  const send = jest.fn().mockResolvedValueOnce(csrf()).mockResolvedValueOnce(response({ id: "user" }))
    .mockResolvedValueOnce(response({ headerName: "X-CSRF-TOKEN", token: "after-login" }))
    .mockResolvedValueOnce(response(null, 204));
  const api = new BetaApi("https://service.example.test", send);
  await api.login(" test@example.test ", "test & pass=word");
  await api.logout();
  expect(send.mock.calls[1][1].body).toBe("email=test%40example.test&password=test+%26+pass%3Dword");
  expect(send.mock.calls[3][1].headers.get("X-CSRF-TOKEN")).toBe("after-login");
});

test("only a 401 means there is no signed-in user", async () => {
  expect(await new BetaApi("http://localhost:8090", jest.fn().mockResolvedValue(response(null, 401))).me()).toBeNull();
  await expect(new BetaApi("http://localhost:8090", jest.fn().mockResolvedValue(response(null, 500))).me()).rejects.toBeInstanceOf(BetaApiError);
  await expect(new BetaApi("http://localhost:8090", jest.fn().mockRejectedValue(new Error("private diagnostic"))).me())
    .rejects.toThrow("Cannot reach the beta service");
});

test("submits revision for updates without adding an owner from the client", async () => {
  const send = jest.fn().mockResolvedValueOnce(csrf()).mockResolvedValueOnce(response({ ...details, id: "child", revision: 3 }));
  await new BetaApi("http://localhost:8090", send).saveChild(details, { ...details, id: "child", revision: 2, hasPhoto: false });
  expect(send.mock.calls[1][0]).toBe("http://localhost:8090/api/children/child");
  expect(send.mock.calls[1][1].method).toBe("PUT");
  expect(JSON.parse(send.mock.calls[1][1].body)).toEqual({ details, revision: 2 });
});

test("keeps authorization errors actionable and stops before an unverified mutation", async () => {
  const send = jest.fn().mockResolvedValue(response(null, 403));
  await expect(new BetaApi("http://localhost:8090", send).saveChild(details)).rejects.toMatchObject({ status: 403 });
  expect(send).toHaveBeenCalledTimes(1);
});

test("times out hung service requests and clears its timer", async () => {
  jest.useFakeTimers();
  try {
    const send = jest.fn((_url, init) => new Promise<Response>((_resolve, reject) => {
      init.signal.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    const pending = new BetaApi("http://localhost:8090", send).me();
    const assertion = expect(pending).rejects.toThrow("Cannot reach the beta service");
    await jest.advanceTimersByTimeAsync(20_001);
    await assertion;
    expect(jest.getTimerCount()).toBe(0);
  } finally { jest.useRealTimers(); }
});
