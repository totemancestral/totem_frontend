import { describe, it, expect } from "vitest";
import { PAGE_ROUTES, authPath, pagePath } from "../src/lib/routes";

describe("PAGE_ROUTES — auth", () => {
  it("expose deux sous-routes distinctes signup/signin (obfuscation conservée)", () => {
    expect(PAGE_ROUTES.auth_signup).toBe("janua_vitae/nova");
    expect(PAGE_ROUTES.auth_signin).toBe("janua_vitae/redivivum");
    expect(PAGE_ROUTES.auth).toBe("janua_vitae");
  });
});

describe("authPath", () => {
  it("construit le lien signup et signin par locale", () => {
    expect(authPath("fr", "signup")).toBe("/fr/janua_vitae/nova");
    expect(authPath("en", "signup")).toBe("/en/janua_vitae/nova");
    expect(authPath("fr", "signin")).toBe("/fr/janua_vitae/redivivum");
    expect(authPath("en", "signin")).toBe("/en/janua_vitae/redivivum");
  });

  it("encode le paramètre redirect", () => {
    expect(authPath("fr", "signup", "/fr/via_sapientiae?restart=1")).toBe(
      "/fr/janua_vitae/nova?redirect=%2Ffr%2Fvia_sapientiae%3Frestart%3D1",
    );
  });

  it("omet le paramètre redirect quand non fourni", () => {
    expect(authPath("fr", "signin")).not.toContain("?");
  });
});

describe("pagePath — reset password reste séparé", () => {
  it("reset_password garde son propre chemin obfusqué", () => {
    expect(pagePath("fr", "reset_password")).toBe("/fr/renovare_clavis");
  });
});
