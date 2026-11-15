export function OfferFeatures({ features }: { features: { title: string; description: string }[] }) {
  return <ul className="mb-2 flex flex-col gap-3">
    {features.map(feature => <li key={feature.title} className="flex items-start gap-2.5">
      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-or" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ivoire sm:text-base">{feature.title}</p>
        <p className="mt-0.5 text-sm leading-snug text-grisclair">{feature.description}</p>
      </div>
    </li>)}
  </ul>;
}
