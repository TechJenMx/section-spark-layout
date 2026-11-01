import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Check, Clock, CalendarHeart } from "lucide-react";
import { Card } from "@/components/AppShell";
import { nowHM, recoveryDay, useRecovery } from "@/lib/recovery-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — Recupera" },
      { name: "description", content: "Resumen diario de tu recuperación: medicamentos, terapia y estado." },
      { property: "og:title", content: "Inicio — Recupera" },
      { property: "og:description", content: "Resumen diario de tu recuperación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const faces = ["😄", "🙂", "😐", "😕", "😣"];

function Index() {
  const { meds, setMeds, therapies, logs } = useRecovery();
  const today = logs[logs.length - 1]!;
  const fecha = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const toggle = (id: string) =>
    setMeds(meds.map((m) => (m.id === id ? { ...m, takenAt: m.takenAt ? undefined : nowHM() } : m)));

  return (
    <>
      <header className="bg-hero rounded-b-[2.5rem] px-5 pb-10 pt-10 text-primary-foreground">
        <p className="capitalize opacity-80">{fecha}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Hola, Jenifer</h1>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 font-medium">
          <CalendarHeart className="h-4 w-4" /> Día {recoveryDay()} de recuperación
        </p>
      </header>

      <div className="-mt-7 px-5 pb-4">
        <Link
          to="/diario"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-5 text-lg font-semibold text-accent-foreground shadow-soft transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" /> Añadir registro de hoy
        </Link>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Medicamentos de hoy</h2>
        <ul className="space-y-2">
          {meds.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => toggle(m.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-muted p-3 text-left"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${m.takenAt ? "border-success bg-success text-primary-foreground" : "border-border"}`}>
                  {m.takenAt && <Check className="h-5 w-5" />}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{m.name} · {m.dose}</span>
                  <span className="text-sm text-muted-foreground">
                    {m.takenAt ? `Tomado a las ${m.takenAt}` : `Pendiente · ${m.time}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Próxima terapia</h2>
        <Link to="/terapias" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Clock /></span>
          <span>
            <span className="block font-medium">{therapies[0]!.name}</span>
            <span className="text-sm text-muted-foreground">Hoy, 18:00 · {therapies[0]!.minutes} min</span>
          </span>
        </Link>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Cómo te sientes</h2>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{faces[Math.min(4, Math.floor(today.pain / 2.2))]}</span>
          <div>
            <p className="font-medium">Molestia {today.pain}/10</p>
            <p className="text-sm text-muted-foreground">Síntoma principal: {today.symptoms[0] ?? "ninguno"}</p>
          </div>
        </div>
      </Card>
    </>
  );
}
