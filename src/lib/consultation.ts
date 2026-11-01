import { z } from "zod";
import type { SymptomLog } from "./recovery-store";

export const consultationInput = z.object({
  consent: z.literal(true),
  logs: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pain: z.number().int().min(1).max(10),
    symptoms: z.array(z.string().max(300)).max(20),
    notes: z.string().max(4000),
  }).strict()).min(1).max(90),
}).strict();

export function selectedDiary(logs: SymptomLog[], dates: string[], includeNotes: boolean) {
  return logs.filter(l => dates.includes(l.date)).sort((a, b) => a.date.localeCompare(b.date))
    .map(l => ({ date: l.date, pain: l.pain, symptoms: l.symptoms, notes: includeNotes ? l.notes : "" }));
}

export type ConsultationEvent = { type: "text" | "reasoning"; text: string } | { type: "error"; message: string } | { type: "done" };