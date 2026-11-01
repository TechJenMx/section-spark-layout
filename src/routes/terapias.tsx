import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Card, PageHeader } from "@/components/AppShell";
import { useRecovery } from "@/lib/recovery-store";

export const Route = createFileRoute("/terapias")({
  head: () => ({
    meta: [
      { title: "Terapias — Recupera" },
      { name: "description", content: "Ejercicios de rehabilitación facial con temporizador y notas." },
      { property: "og:title", content: "Terapias — Recupera" },
      { property: "og:description", content: "Ejercicios de rehabilitación con guía." },
    ],
  }),
  component: Terapias,
});

function Terapias() {
  const { therapies, sessionNotes, setSessionNote } = useRecovery();
  const [activeId, setActiveId] = useState(therapies[0]!.id);
  const active = therapies.find((t) => t.id === activeId)!;
  const [left, setLeft] = useState(active.minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => { setLeft(active.minutes * 60); setRunning(false); }, [activeId]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? (setRunning(false), 0) : l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const pct = 1 - left / (active.minutes * 60);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <>
      <PageHeader title="Terapias" subtitle="Tus ejercicios asignados" />
      <div className="mb-4 flex gap-2 overflow-x-auto px-5">
        {therapies.map((t) => (
          <button key={t.id} onClick={() => setActiveId(t.id)} className={`shrink-0 rounded-full px-4 py-2.5 font-medium ${t.id === activeId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t.name}
          </button>
        ))}
      </div>

      <Card className="text-center">
        <p className="text-sm text-muted-foreground">{active.reps} · {active.minutes} min</p>
        <div className="relative mx-auto my-5 grid h-48 w-48 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${pct * 360}deg, var(--muted) 0deg)` }}>
          <div className="grid h-40 w-40 place-items-center rounded-full bg-card">
            <span className="font-display text-5xl">{mm}:{ss}</span>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={() => setRunning(!running)} className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-primary-foreground">
            {running ? <><Pause /> Pausar</> : <><Play /> Iniciar</>}
          </button>
          <button aria-label="Reiniciar" onClick={() => { setRunning(false); setLeft(active.minutes * 60); }} className="rounded-2xl bg-secondary px-4 text-secondary-foreground"><RotateCcw /></button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Instrucciones</h2>
        <p className="leading-relaxed text-muted-foreground">{active.steps}</p>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Notas de la sesión</h2>
        <textarea rows={3} value={sessionNotes[active.id] ?? ""} onChange={(e) => setSessionNote(active.id, e.target.value)} placeholder="¿Hubo dolor, fatiga o molestia?" className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
      </Card>
    </>
  );
}
