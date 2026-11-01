import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/consulta")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleConsultation } = await import("@/lib/consultation.server");
    return handleConsultation(request);
  } } },
});