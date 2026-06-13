"use client";
import { useState, useEffect } from "react";

const COOKIE_CONSENT_KEY = "totem_cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300] border-t p-4 md:p-6"
      style={{
        background: "rgba(26,26,46,0.97)",
        borderColor: "rgba(201,168,76,0.3)",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed" style={{ color: "var(--ivoire)" }}>
          Ce site utilise des cookies techniques et analytiques pour votre expérience.
          En poursuivant votre navigation, vous acceptez leur utilisation.
          {" "}
          <a href="/fr/arcanum_privata" className="underline" style={{ color: "var(--or-ancestral)" }}>
            En savoir plus
          </a>
        </p>
        <button onClick={accept} className="btn-primary whitespace-nowrap text-sm">
          Accepter
        </button>
      </div>
    </div>
  );
}
