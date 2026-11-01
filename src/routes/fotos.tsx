import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera } from "lucide-react";
import { Card, PageHeader } from "@/components/AppShell";
import { recoveryDay, useRecovery } from "@/lib/recovery-store";

export const Route = createFileRoute("/fotos")({
  head: () => ({
    meta: [
      { title: "Evolución fotográfica — Recupera" },
      { name: "description", content: "Captura guiada de tu rostro y comparador antes y después." },
      { property: "og:title", content: "Evolución fotográfica — Recupera" },
      { property: "og:description", content: "Compara tu progreso día a día." },
    ],
  }),
  component: Fotos,
});

const poses = ["Frente", "Sonriendo", "Ojos cerrados", "Soplando"];

function Fotos() {
  const { photos, addPhoto } = useRecovery();
  const [pose, setPose] = useState(poses[0]);
  const [view, setView] = useState<"grid" | "compare">("grid");
  const ofPose = photos.filter((p) => p.pose === pose);

  return (
    <>
      <PageHeader title="Evolución" subtitle="Toma tus fotos siempre a la misma distancia" />
      <div className="mb-4 flex gap-2 overflow-x-auto px-5">
        {poses.map((p) => (
          <button key={p} onClick={() => setPose(p)} className={`shrink-0 rounded-full px-4 py-2.5 font-medium ${p === pose ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{p}</button>
        ))}
      </div>

      <Card>
        <label className="relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl bg-muted">
          <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full text-primary" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 8">
            <ellipse cx="150" cy="180" rx="95" ry="125" />
            <line x1="150" y1="60" x2="150" y2="300" strokeOpacity=".3" />
            <line x1="60" y1="160" x2="240" y2="160" strokeOpacity=".3" />
          </svg>
          <span className="absolute inset-x-0 bottom-5 mx-auto flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            <Camera /> Tomar foto · {pose}
          </span>
          <input
            type="file" accept="image/*" capture="user" className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) addPhoto({ id: crypto.randomUUID(), date: `Día ${recoveryDay()}`, pose, url: URL.createObjectURL(f) });
            }}
          />
        </label>
        <p className="mt-3 text-center text-sm text-muted-foreground">Alinea tu rostro dentro de la silueta</p>
      </Card>

      <div className="mx-5 mb-4 grid grid-cols-2 rounded-2xl bg-muted p-1">
        {(["grid", "compare"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`rounded-xl py-3 font-medium ${view === v ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
            {v === "grid" ? "Línea de tiempo" : "Antes y después"}
          </button>
        ))}
      </div>

      <Card>
        {ofPose.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Aún no hay fotos de “{pose}”.</p>
        ) : view === "grid" ? (
          <div className="grid grid-cols-3 gap-2">
            {ofPose.map((p) => (
              <figure key={p.id}><img src={p.url} alt={`${p.pose} ${p.date}`} className="aspect-square w-full rounded-xl object-cover" /><figcaption className="mt-1 text-xs text-muted-foreground">{p.date}</figcaption></figure>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[ofPose[0]!, ofPose[ofPose.length - 1]!].map((p, i) => (
              <figure key={i}><img src={p.url} alt={p.date} className="aspect-[3/4] w-full rounded-xl object-cover" /><figcaption className="mt-1 text-center text-sm font-medium">{i ? "Después" : "Antes"} · {p.date}</figcaption></figure>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
