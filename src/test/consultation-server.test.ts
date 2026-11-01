import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  state: undefined as { status: number; message: string } | undefined,
  upstream: 200,
  calls: 0,
  saved: vi.fn(),
}));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: mocks.state ?? null, error: null }) }) }),
    upsert: async (row: { status: number; message: string }) => { mocks.saved(row); mocks.state = row; return { error: null }; },
  }),
} }));
vi.mock("@/lib/ai/responses.server", () => ({
  createResponsesCall: (_request: Request, _key: string, _messages: unknown, _instructions: string, onResponse: (r: Response) => Promise<void>) => {
    mocks.calls++;
    return { gateway: { getRunId: () => undefined }, result: { fullStream: (async function* () {
      await onResponse(mocks.upstream === 200 ? new Response() : Response.json({ message: "Acceso bloqueado por el proveedor" }, { status: mocks.upstream }));
      if (mocks.upstream !== 200) yield { type: "error", error: new Error("denied") };
      else {
        yield { type: "reasoning-delta", text: "Revisando fechas" };
        yield { type: "text-delta", text: "Resumen de cambios\n" };
        yield { type: "text-delta", text: "Molestia de 5 a 3." };
      }
    })() } };
  },
}));
import { handleConsultation } from "@/lib/consultation.server";
const body = { consent: true, logs: [{ date: "2026-11-01", pain: 3, symptoms: ["Ojo seco"], notes: "Mejor" }] };
const request = (payload: unknown = body, origin = "http://localhost:8080") => new Request("http://localhost:8080/api/consulta", {
  method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(payload),
});
beforeEach(() => { mocks.state = undefined; mocks.upstream = 200; mocks.calls = 0; mocks.saved.mockClear(); vi.stubEnv("LOVABLE_API_KEY", "test-key"); });
describe("Consultation endpoint", () => {
  it("rejects cross-origin sharing before calling the model", async () => {
    expect((await handleConsultation(request(body, "https://other.example"))).status).toBe(403);
    expect(mocks.calls).toBe(0);
  });
  it("does not call the model without health-data consent", async () => {
    expect((await handleConsultation(request({ ...body, consent: false }))).status).toBe(400);
    expect(mocks.calls).toBe(0);
  });
  it("streams reasoning and text separately and completes the result", async () => {
    const response = await handleConsultation(request());
    const events = (await response.text()).trim().split("\n").map(line => JSON.parse(line));
    expect(events).toEqual([{ type: "reasoning", text: "Revisando fechas" }, { type: "text", text: "Resumen de cambios\n" }, { type: "text", text: "Molestia de 5 a 3." }, { type: "done" }]);
  });
  it("preserves a provider denial and pauses subsequent requests", async () => {
    mocks.upstream = 403;
    const first = await handleConsultation(request());
    expect(first.status).toBe(403);
    expect(await first.json()).toEqual({ message: "Acceso bloqueado por el proveedor" });
    expect(mocks.saved).toHaveBeenCalledWith({ id: "consultation", status: 403, message: "Acceso bloqueado por el proveedor" });
    expect((await handleConsultation(request())).status).toBe(403);
    expect(mocks.calls).toBe(1);
  });
  it("pauses on insufficient credits without automatically retrying", async () => {
    mocks.upstream = 402;
    expect((await handleConsultation(request())).status).toBe(402);
    expect((await handleConsultation(request())).status).toBe(402);
    expect(mocks.calls).toBe(1);
  });
});