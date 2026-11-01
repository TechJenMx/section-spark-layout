import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server.ts";

// Adapted from the Gateway Responses helper; interception preserves upstream failures.
export function createResponsesCall(request: Request, apiKey: string, messages: ModelMessage[], instructions: string,
  onResponse: (response: Response) => Promise<void>) {
  const gateway = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: (input, init) => gateway.fetch(input, init),
  });
  // Intercept before the run-ID promise settles, so pre-stream errors keep their status.
  const originalFetch = gateway.fetch;
  gateway.fetch = async (input, init) => {
    const response = await fetch(input, init);
    await onResponse(response);
    // Capture the issued run ID without making a second network request.
    return response;
  };
  // Use the original correlation wrapper around the intercepting transport below.
  gateway.fetch = originalFetch;
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