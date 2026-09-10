import type { Dictionary } from "@/app/[lang]/dictionaries";

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-or">✓</span>
    ) : (
      <span className="text-gris">—</span>
    );
  }
  return <span className="text-ivoire">{value}</span>;
}

export default function OffresComparatif({ dict }: { dict: Dictionary["offresComparatif"] }) {
  return (
    <section className="hidden bg-nuit px-6 py-24 lg:block lg:px-16 lg:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-3xl text-ivoire lg:text-4xl">{dict.title}</h2>
      </div>

      <div className="mx-auto mt-14 max-w-5xl overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-1/4" />
              {dict.columns.map((col) => (
                <th
                  key={col.name}
                  className={`border-b p-5 text-center ${
                    col.featured ? "border-or bg-indigo" : "border-ombre"
                  }`}
                >
                  <div className="font-display text-xl text-ivoire">{col.name}</div>
                  <div className={`font-display mt-1 text-2xl ${col.featured ? "text-or" : "text-ivoire"}`}>
                    {col.price}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dict.rows.map((row) => (
              <tr key={row.label} className="border-b border-ombre">
                <td className="py-4 pr-4 text-grisclair">{row.label}</td>
                {row.values.map((value, i) => (
                  <td
                    key={i}
                    className={`py-4 text-center ${dict.columns[i]?.featured ? "bg-indigo" : ""}`}
                  >
                    <Cell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
