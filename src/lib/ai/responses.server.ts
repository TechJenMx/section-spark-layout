import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server.ts";

// Adapted from the Gateway Responses helper; interception preserves upstream failures.
export function createResponsesCall(request: Request, apiKey: string, messages: ModelMessage[], instructions: string,
  onResponse: (response: Response) => Promise<void>) {
  const correlated = createLovableAiGatewayRunIdFetch();
  const originalGlobal = correlated.fetch;
  const wrappedProvider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const response = await originalGlobal(input, init);
      await onResponse(response);
      return response;
    },
  });
  const result = streamText({
    model: wrappedProvider.responses("openai/gpt-6-astra"), instructions, messages,
    abortSignal: request.signal, maxRetries: 0,
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto",
      store: false, include: ["reasoning.encrypted_content"] } },
  });
  return { result, gateway: correlated };
}