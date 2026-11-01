import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Card, PageHeader } from "@/components/AppShell";
import { recoveryDay, useRecovery } from "@/lib/recovery-store";

export const Route = createFileRoute("/reporte")({
  head: () => ({
    meta: [
      { title: "Reporte médico — Recupera" },
      { name: "description", content: "Adherencia a medicamentos y evolución de síntomas para tu médico." },
      { property: "og:title", content: "Reporte médico — Recupera" },
      { property: "og:description", content: "Resumen para tu neurólogo o fisioterapeuta." },
    ],
  }),
  component: Reporte,
});

function Reporte() {
  const { meds, logs } = useRecovery();
  const adherence = Math.round((meds.filter((m) => m.takenAt).length / meds.length) * 100);
  const last = logs.slice(-10);

  return (
    <>
      <PageHeader title="Reporte" subtitle={`Resumen de ${recoveryDay()} días de recuperación`} />
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Adherencia a medicamentos hoy</h2>
        <div className="flex items-center gap-4">
          <span className="font-display text-5xl text-primary">{adherence}%</span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${adherence}%` }} /></div>
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Evolución de la molestia</h2>
        <div className="flex h-40 items-end gap-2">
          {last.map((l, i) => (
            <div key={l.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{l.pain}</span>
              <div className="w-full rounded-t-lg bg-primary" style={{ height: `${l.pain * 12}px`, opacity: 0.45 + (i / last.length) * 0.55 }} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Últimos {last.length} registros (1 = leve, 10 = intensa)</p>
      </Card>
      <Card>
        <h2 className="mb-2 text-lg font-semibold">Síntomas frecuentes</h2>
        <ul className="space-y-1 text-muted-foreground">
          {Object.entries(logs.flatMap((l) => l.symptoms).reduce<Record<string, number>>((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {})).map(([s, n]) => (
            <li key={s} className="flex justify-between"><span>{s}</span><span className="font-semibold text-foreground">{n} días</span></li>
          ))}
        </ul>
      </Card>
      <div className="px-5">
        <button onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-5 text-lg font-semibold text-accent-foreground shadow-soft">
          <Download /> Exportar reporte PDF
        </button>
      </div>
    </>
  );
}
