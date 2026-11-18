import { adultIdentityEntries, type AdultIdentityData } from "@/lib/adult-identity";

export function AdultIdentityFields({ identity, lang }: { identity: AdultIdentityData; lang: "fr" | "en" }) {
  return <dl className="mb-8 grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 border-y border-[#8B6F2E]/30 py-6 sm:grid-cols-2">
    {adultIdentityEntries(identity, lang).map(({ label, value }, index) => <div key={label} className={`min-w-0 ${index > 1 ? "sm:col-span-2" : ""}`}>
      <dt className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B6F2E" }}>{label}</dt>
      <dd className="font-display text-lg leading-relaxed wrap-anywhere">{value}</dd>
    </div>)}
  </dl>;
}
