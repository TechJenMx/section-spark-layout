import { describe, expect, it } from "vitest";
import { consultationInput, selectedDiary } from "@/lib/consultation";

const logs = [
  { date: "2026-11-01", pain: 3, symptoms: ["Ojo seco"], notes: "Me siento mejor" },
  { date: "2026-10-31", pain: 5, symptoms: ["Ojo seco"], notes: "Dolor nocturno" },
];
describe("Sharing diary data for a consultation", () => {
  it("sends only the selected symptoms and diary notes", () => {
    expect(selectedDiary(logs, ["2026-11-01"], true)).toEqual([logs[0]]);
  });
  it("excludes notes when sharing them is not authorized", () => {
    expect(selectedDiary(logs, ["2026-11-01"], false)[0]?.notes).toBe("");
  });
  it("requires explicit consent before sending health data", () => {
    expect(consultationInput.safeParse({ consent: false, logs }).success).toBe(false);
    expect(consultationInput.safeParse({ consent: true, logs }).success).toBe(true);
  });
  it("rejects an empty diary instead of inventing a summary", () => {
    expect(consultationInput.safeParse({ consent: true, logs: [] }).success).toBe(false);
  });
});