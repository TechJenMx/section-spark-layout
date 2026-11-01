import { createContext, useContext, useState, type ReactNode } from "react";

export type Med = { id: string; name: string; dose: string; time: string; days: number; takenAt?: string };
export type Therapy = { id: string; name: string; minutes: number; reps: string; steps: string };
export type SymptomLog = { date: string; pain: number; symptoms: string[]; notes: string };
export type Photo = { id: string; date: string; pose: string; url: string };

export const START_DATE = new Date(Date.now() - 11 * 86400000);
export const recoveryDay = () => Math.floor((Date.now() - START_DATE.getTime()) / 86400000) + 1;

const initialMeds: Med[] = [
  { id: "1", name: "Prednisona", dose: "50 mg", time: "08:00", days: 10, takenAt: "08:05" },
  { id: "2", name: "Aciclovir", dose: "400 mg", time: "14:00", days: 7 },
  { id: "3", name: "Lágrimas artificiales", dose: "2 gotas", time: "20:00", days: 30 },
];
const initialTherapies: Therapy[] = [
  { id: "1", name: "Ejercicios frente al espejo", minutes: 10, reps: "3 series × 10", steps: "Eleva las cejas, cierra los ojos suavemente, sonríe y sopla. Mantén cada gesto 5 segundos." },
  { id: "2", name: "Masaje facial", minutes: 5, reps: "Movimientos circulares", steps: "Desde la barbilla hacia la sien, con presión suave en el lado afectado." },
  { id: "3", name: "Termoterapia", minutes: 15, reps: "1 aplicación", steps: "Compresa tibia sobre la mejilla y detrás de la oreja. Nunca caliente en exceso." },
];
const initialLogs: SymptomLog[] = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 3].map((pain, i) => ({
  date: new Date(START_DATE.getTime() + i * 86400000).toISOString().slice(0, 10),
  pain,
  symptoms: i < 6 ? ["Ojo seco", "Asimetría al sonreír"] : ["Asimetría al sonreír"],
  notes: "",
}));

type Store = {
  meds: Med[]; setMeds: (m: Med[]) => void;
  therapies: Therapy[];
  logs: SymptomLog[]; addLog: (l: SymptomLog) => void;
  photos: Photo[]; addPhoto: (p: Photo) => void;
  sessionNotes: Record<string, string>; setSessionNote: (id: string, n: string) => void;
};
const Ctx = createContext<Store | null>(null);

export function RecoveryProvider({ children }: { children: ReactNode }) {
  const [meds, setMeds] = useState(initialMeds);
  const [logs, setLogs] = useState(initialLogs);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sessionNotes, setNotes] = useState<Record<string, string>>({});
  return (
    <Ctx.Provider
      value={{
        meds, setMeds, therapies: initialTherapies, logs,
        addLog: (l) => setLogs((p) => [...p.filter((x) => x.date !== l.date), l]),
        photos, addPhoto: (ph) => setPhotos((p) => [...p, ph]),
        sessionNotes, setSessionNote: (id, n) => setNotes((p) => ({ ...p, [id]: n })),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export const useRecovery = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("RecoveryProvider missing");
  return c;
};
export const nowHM = () => new Date().toTimeString().slice(0, 5);
export const SYMPTOMS = ["Ojo seco / dificultad para cerrar el ojo", "Alteración del gusto", "Dolor detrás de la oreja", "Sensibilidad al ruido", "Asimetría al sonreír o levantar la ceja"];
