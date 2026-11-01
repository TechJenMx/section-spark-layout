import { useEffect, useRef, useState } from "react";
import { Check, Clipboard, LoaderCircle, Share2, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectedDiary, type ConsultationEvent } from "@/lib/consultation";
import { useRecovery } from "@/lib/recovery-store";

export function ConsultationAssistant() {
  const { logs } = useRecovery();
  const [dates, setDates] = useState<string[]>([]);
  const [notes, setNotes] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [feedback, setFeedback] = useState("");
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const entries = selectedDiary(logs, dates, notes);
  const ordered = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  async function generate() {
    if (!consent || !entries.length || busy) return;
    const controller = new AbortController(); abort.current = controller;
    setBusy(true); setAnswer(""); setReasoning(""); setError(""); setComplete(false); setFeedback("");
    try {
      const response = await fetch("/api/consulta", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent, logs: entries }), signal: controller.signal });
      if (!response.ok) { const body = await response.json(); throw new Error(body.message ?? "No se pudo generar el resumen."); }
      if (!response.body) throw new Error("No se recibió el resumen.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let ended = false;
      function consume(line: string) {
        if (!line.trim()) return;
        const event = JSON.parse(line) as ConsultationEvent;
        if (event.type === "text") setAnswer(prev => prev + event.text);
        if (event.type === "reasoning") setReasoning(prev => prev + event.text);
        if (event.type === "error") { ended = true; setError(event.message); }
        if (event.type === "done") { ended = true; setComplete(true); }
      }
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() ?? ""; lines.forEach(consume);
      }
      buffer += decoder.decode(); consume(buffer);
      if (!ended) setError("Se interrumpió el resumen. El texto puede estar incompleto.");
    } catch (e) {
      setError(controller.signal.aborted ? "Generación detenida. El texto puede estar incompleto." : e instanceof Error ? e.message : "No se pudo generar el resumen.");
    } finally { setBusy(false); abort.current = null; }
  }
  const shareText = `Mi próxima consulta — Recupera\n\n${answer}\n\nBorrador generado con IA. No sustituye una valoración médica.`;
  async function copy() {
    try { await navigator.clipboard.writeText(shareText); setFeedback("Resumen copiado"); }
    catch { setFeedback("No se pudo copiar. Puedes seleccionar el texto."); }
  }
  async function share() {
    if (!navigator.share) { await copy(); return; }
    try { await navigator.share({ title: "Mi próxima consulta", text: shareText }); setFeedback("Resumen compartido"); }
    catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setFeedback("No se pudo compartir. Prueba copiar el resumen."); }
  }
  return (
    <section id="consulta" className="mx-5 mb-6 border-y py-6">
      <div className="mb-4 flex items-center gap-3"><Sparkles className="h-6 w-6 text-primary" /><h2 className="font-display text-2xl">Mi próxima consulta</h2></div>
      <p className="mb-4 text-sm text-muted-foreground">Borrador con IA · No sustituye una valoración médica.</p>
      <fieldset disabled={busy} className="space-y-3">
        <legend className="mb-2 font-semibold">Registros que quieres compartir</legend>
        <div className="max-h-64 overflow-y-auto divide-y rounded-lg border bg-card">
          {ordered.map(l => <label key={l.date} className="flex cursor-pointer items-start gap-3 p-3">
            <input type="checkbox" checked={dates.includes(l.date)} onChange={e => { setConsent(false); setDates(prev => e.target.checked ? [...prev, l.date] : prev.filter(d => d !== l.date)); }} className="mt-1 h-4 w-4 accent-primary" />
            <span className="min-w-0 text-sm"><span className="block font-semibold">{l.date} · Molestia {l.pain}/10</span><span className="block break-words text-muted-foreground">{l.symptoms.join(", ") || "Sin síntomas anotados"}</span>{l.notes && <span className="mt-1 block break-words">{l.notes}</span>}</span>
          </label>)}
          {!ordered.length && <p className="p-3 text-sm text-muted-foreground">Aún no hay registros en el diario.</p>}
        </div>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={notes} onChange={e => { setNotes(e.target.checked); setConsent(false); }} className="mt-1 h-4 w-4 accent-primary" />Incluir las notas del diario</label>
        <p className="text-sm text-muted-foreground">{entries.length} registros seleccionados. Solo se enviarán fechas, síntomas, molestia y las notas que autorices. No incluyas nombres ni datos de contacto. Los registros iniciales son ejemplos; desmárcalos si no son tuyos.</p>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />Autorizo enviar estos datos de salud a Lovable AI para preparar mi consulta.</label>
      </fieldset>
      <div className="mt-4 flex gap-2">
        <Button disabled={busy || !consent || !entries.length} onClick={generate} className="h-auto flex-1 whitespace-normal py-3">{busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}Preparar consulta</Button>
        {busy && <Button variant="outline" onClick={() => abort.current?.abort()} className="h-auto py-3"><Square />Detener</Button>}
      </div>
      {busy && <p role="status" className="mt-3 text-sm text-muted-foreground">{answer ? "Redactando el resumen…" : "Revisando tus registros…"}</p>}
      {reasoning && <details className="mt-3 text-sm text-muted-foreground"><summary>Revisión de la IA</summary><p className="mt-2 whitespace-pre-wrap break-words">{reasoning}</p></details>}
      {error && <p role="alert" className="mt-3 break-words text-sm text-destructive">{error}</p>}
      {answer && <div className="mt-5 border-t pt-4"><h3 className="mb-3 font-semibold">{complete ? "Borrador para tu consulta" : "Borrador incompleto"}</h3><div className="whitespace-pre-wrap break-words leading-relaxed">{answer}</div>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={copy} disabled={!complete}><Clipboard />Copiar</Button><Button variant="secondary" onClick={share} disabled={!complete}><Share2 />Compartir</Button></div>
      </div>}
      {feedback && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Check className="h-4 w-4" />{feedback}</p>}
      <p className="mt-4 text-xs text-muted-foreground">Los registros y el borrador se perderán al recargar. Revisa el resultado antes de compartirlo. Ante síntomas súbitos graves, busca atención urgente.</p>
    </section>
  );
}