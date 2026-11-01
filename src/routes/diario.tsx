import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Card, PageHeader } from "@/components/AppShell";
import { SYMPTOMS, nowHM, useRecovery } from "@/lib/recovery-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Diario — Recupera" },
      { name: "description", content: "Registra tus medicamentos y síntomas del día." },
      { property: "og:title", content: "Diario — Recupera" },
      { property: "og:description", content: "Medicamentos y síntomas diarios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Diario,
});

const faceScale = ["😄", "🙂", "😐", "😕", "😣"];
const inputCls = "w-full rounded-xl border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring";

function Diario() {
  const { meds, setMeds, addLog } = useRecovery();
  const [tab, setTab] = useState<"med" | "sin">("med");
  const [form, setForm] = useState({ name: "", dose: "", time: "08:00", days: "7" });
  const [pain, setPain] = useState(3);
  const [sel, setSel] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageHeader title="Diario" subtitle="Medicamentos y síntomas" />
      <div className="mx-5 mb-4 grid grid-cols-2 rounded-2xl bg-muted p-1">
        {(["med", "sin"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl py-3 font-medium ${tab === t ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}>
            {t === "med" ? "Medicamentos" : "Síntomas"}
          </button>
        ))}
      </div>

      {tab === "med" ? (
        <>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Medicamentos activos</h2>
            <ul className="divide-y">
              {meds.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.dose} · diario a las {m.time} · {m.days} días</p>
                  </div>
                  <button
                    onClick={() => setMeds(meds.map((x) => (x.id === m.id ? { ...x, takenAt: x.takenAt ? undefined : nowHM() } : x)))}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium ${m.takenAt ? "bg-success text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                  >
                    <Check className="h-4 w-4" /> {m.takenAt ?? "Tomar"}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Agregar medicamento</h2>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.name) return;
                setMeds([...meds, { id: crypto.randomUUID(), name: form.name, dose: form.dose, time: form.time, days: Number(form.days) }]);
                setForm({ name: "", dose: "", time: "08:00", days: "7" });
              }}
            >
              <input className={inputCls} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={inputCls} placeholder="Dosis (ej. 50 mg)" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-muted-foreground">Hora<input type="time" className={inputCls} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
                <label className="text-sm text-muted-foreground">Duración (días)<input type="number" min={1} className={inputCls} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} /></label>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground"><Plus className="h-5 w-5" /> Guardar</button>
            </form>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <h2 className="mb-1 text-lg font-semibold">Nivel de molestia</h2>
            <p className="mb-3 text-4xl font-display">{faceScale[Math.min(4, Math.floor(pain / 2.2))]} {pain}/10</p>
            <input type="range" min={1} max={10} value={pain} onChange={(e) => setPain(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-sm text-muted-foreground"><span>Leve</span><span>Intensa</span></div>
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Síntomas de hoy</h2>
            <div className="space-y-2">
              {SYMPTOMS.map((s) => {
                const on = sel.includes(s);
                return (
                  <button key={s} onClick={() => setSel(on ? sel.filter((x) => x !== s) : [...sel, s])} className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left ${on ? "border-primary bg-secondary" : "border-transparent bg-muted"}`}>
                    <span className={`grid h-6 w-6 place-items-center rounded-md border-2 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{on && <Check className="h-4 w-4" />}</span>
                    {s}
                  </button>
                );
              })}
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Notas</h2>
            <textarea rows={3} className={inputCls} placeholder="¿Cómo te sentiste hoy?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button
              onClick={() => { addLog({ date: new Date().toISOString().slice(0, 10), pain, symptoms: sel, notes }); setSaved(true); }}
              className="mt-3 w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground"
            >
              {saved ? "✓ Registro guardado" : "Guardar registro"}
            </button>
            {saved && <Button asChild variant="outline" className="mt-3 h-auto w-full whitespace-normal py-3"><Link to="/reporte" hash="consulta">Preparar mi consulta con IA</Link></Button>}
          </Card>
        </>
      )}
    </>
  );
}
