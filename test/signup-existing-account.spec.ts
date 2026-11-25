import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/auth/signup/route";

const mocks = vi.hoisted(() => ({ listUsers: vi.fn(), signUp: vi.fn(), limit: vi.fn() }));
vi.mock("../lib/supabase/server", () => ({
  createServiceClient: () => ({ auth: { admin: { listUsers: mocks.listUsers } } }),
  createPublicAuthClient: () => ({ auth: { signUp: mocks.signUp } }),
}));
vi.mock("../lib/rate-limit", () => ({ rateLimit: mocks.limit }));
vi.mock("../lib/env", () => ({ getServerEnv: () => ({ NEXT_PUBLIC_SITE_URL: "https://totem.example" }) }));

const request = (locale = "fr") => new Request("http://localhost/api/auth/signup", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "  Test@Example.com  ", password: "StrongPassword1", prenom: "Nadia", nom: "Diop", sexe: "femme", parcours: "adulte", majorite_confirmee: true, date_naissance: "05-21", locale }),
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.limit.mockResolvedValue(null);
  mocks.listUsers.mockResolvedValue({ data: { users: [] }, error: null });
  mocks.signUp.mockResolvedValue({ data: { user: { identities: [{ id: "new" }] }, session: null }, error: null });
});

describe("existing account at signup", () => {
  it.each(["email", "password", "prenom", "nom", "sexe", "majorite_confirmee", "date_naissance"])("rejects missing required adult field: %s", async field => {
    const body = await request().json();
    delete body[field];
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }));
    expect(response.status).toBe(422);
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
  it.each(["email", "password", "prenom", "sexe", "tranche_age"])("rejects missing required Junior field: %s", async field => {
    const body = { ...await request().json(), parcours: "junior", tranche_age: "11-14" };
    delete body[field];
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }));
    expect(response.status).toBe(422);
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
  it("persists the adult surname and given name in signup metadata", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.signUp.mock.calls[0]?.[0].options.data).toMatchObject({ nom: "Diop", prenom: "Nadia" });
  });
  it.each([undefined, "", "   ", "x".repeat(81)])("rejects an adult surname that is missing or invalid", async nom => {
    const body = await request().json();
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nom }),
    }));
    expect(response.status).toBe(422);
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
  it("does not expose an unknown Auth provider error", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.signUp.mockResolvedValueOnce({ data: {}, error: { status: 400, message: "private database schema diagnostic" } });
    const response = await POST(request("en"));
    const body = await response.json();
    expect(body.code).toBe("signup_rejected");
    expect(JSON.stringify(body)).not.toContain("private");
    vi.restoreAllMocks();
  });
  it.each([true, false])("rejects an existing account (confirmed=%s) before sending any signup email", async (confirmed) => {
    mocks.listUsers.mockResolvedValue({ data: { users: [{ email: "test@example.com", email_confirmed_at: confirmed ? "2026-01-01" : null }] }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "email_exists", error: expect.stringContaining("Un compte existe déjà") });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("checks later Auth pages and returns the English message", async () => {
    mocks.listUsers.mockResolvedValueOnce({ data: { users: Array.from({ length: 1000 }, (_, i) => ({ email: `user${i}@example.com` })) }, error: null })
      .mockResolvedValueOnce({ data: { users: [{ email: "TEST@example.com" }] }, error: null });
    const response = await POST(request("en"));
    expect(response.status).toBe(409);
    expect((await response.json()).error).toContain("An account already exists");
    expect(mocks.listUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 1000 });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("lets a new address use the normal confirmation flow", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, sessionReady: false });
    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({ email: "test@example.com" }));
  });

  it.each([
    { data: { user: { identities: [] }, session: null }, error: null },
    { data: {}, error: { code: "user_already_exists", message: "User already registered", status: 422 } },
  ])("also handles a duplicate returned by Supabase after the pre-check", async (result) => {
    mocks.signUp.mockResolvedValue(result);
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("email_exists");
  });

  it("does not send a signup email when the account lookup fails", async () => {
    mocks.listUsers.mockResolvedValue({ data: { users: [] }, error: new Error("Lookup unavailable") });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
});


describe("birth date at signup", () => {
  it.each([undefined, "", "02-30", "04-31", "13-01", "00-12", "12-00", "2-3", "2025-02-29", "2999-01-01", "21/05/2000"])("rejects invalid or missing date %s", async (date) => {
    const body = await request().json();
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, date_naissance: date }),
    }));
    expect(response.status).toBe(422);
    expect((await response.json()).code).toBe("invalid_birth_date");
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("persists the Junior age group without a birthday or surname", async () => {
    const body = await request().json();
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, parcours: "junior", tranche_age: "11-14", nom: "Ignored", date_naissance: "02-29" }),
    }));
    expect(response.status).toBe(200);
    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ data: expect.objectContaining({
        parcours: "junior", tranche_age: "11-14", nom: "", naissance_concerne: "enfant",
      }) }),
    }));
    const metadata = mocks.signUp.mock.calls[0]?.[0].options.data;
    expect(metadata).not.toHaveProperty("date_naissance");
    expect(metadata).not.toHaveProperty("majorite_confirmee");
  });
  it("discards the year from an already-open legacy signup form", async () => {
    const body = await request().json();
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, date_naissance: "2000-05-21" }),
    }));
    expect(response.status).toBe(200);
    expect(mocks.signUp.mock.calls[0]?.[0].options.data.date_naissance).toBe("05-21");
  });
});

describe("signup age rules", () => {
  it.each([false, undefined, "true"])("rejects an adult declaration %s before sending an email", async majorite_confirmee => {
    const body = await request().json();
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, majorite_confirmee }),
    }));
    expect(response.status).toBe(422);
    expect((await response.json()).code).toBe("invalid_age");
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it.each(["moins-11", undefined, "18-25"])("rejects an unsupported Junior age group %s", async tranche_age => {
    const body = await request().json();
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, parcours: "junior", tranche_age }),
    }));
    expect(response.status).toBe(422);
    expect((await response.json()).code).toBe("invalid_age");
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it.each(["11-14", "15-17"])("accepts Junior group %s without a birthday and routes to the Junior questionnaire", async tranche_age => {
    const body = await request().json();
    delete body.date_naissance;
    const response = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, parcours: "junior", tranche_age, redirectPath: "/fr/parcours" }),
    }));
    expect(response.status).toBe(200);
    const options = mocks.signUp.mock.calls[0]?.[0].options;
    expect(options.data.tranche_age).toBe(tranche_age);
    expect(options.emailRedirectTo).toContain(encodeURIComponent("/fr/parcours-junior"));
  });
});
