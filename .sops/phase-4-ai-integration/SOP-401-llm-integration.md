---
sop: "SOP-401"
title: "LLM Integration"
phase: 4
iterative: true
prerequisites:
  - sop: "SOP-400"
    output: "/docs/ai/feasibility-assessment.md"
outputs:
  - "src/lib/ai/client.ts"
  - "src/lib/ai/prompts.ts"
  - "src/lib/ai/errors.ts"
  - "src/app/api/chat/route.ts"
related: ["SOP-400", "SOP-402", "SOP-403"]
---

# SOP-401: LLM Integration

## Purpose

Implement LLM API integration with streaming, structured outputs, error handling, and cost efficiency.

## Scope

- **Covers:** SDK setup, prompt patterns, streaming, RAG basics, error handling, token management
- **Excludes:** Custom model training, vector database management

## Prerequisites

- [ ] SOP-400 completed — use cases and provider selected
- [ ] API keys obtained
- [ ] Budget limits established

## Procedure

### 1. Install SDK

```bash
pnpm add ai @ai-sdk/openai          # Vercel AI SDK (recommended for Next.js)
pnpm add openai                     # Direct OpenAI SDK (if not using Vercel AI)
pnpm add @anthropic-ai/sdk          # Anthropic (if selected)
pnpm add tiktoken                   # Token counting
```

### 2. Configure Environment Variables

Add to `.env` (and `.env.example` with placeholder values):

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` (if using)
- `AI_MODEL` (default model selection, e.g. `gpt-4o`)

### 3. Create AI Client (`src/lib/ai/client.ts`)

Guard against missing API key at startup. Export singleton client + `DEFAULT_MODEL` constant from env.

### 4. Implement Core Patterns (per use case)

**A. Simple Text Completion** (`src/lib/ai/completions.ts`)

Function: `generateCompletion({ prompt, systemPrompt?, maxTokens?, temperature? }): Promise<string>`. Call `chat.completions.create` with system + user messages. Return `choices[0].message.content || ''`.

**B. Streaming Chat** (`src/app/api/chat/route.ts`)

Use Vercel AI SDK `streamText` with `ai-sdk/openai` model. Return `result.toDataStreamResponse()`. Mark route as `runtime = 'edge'` optionally.

Client: `useChat({ api: '/api/chat' })` from `ai/react`. Display messages; show loading indicator while `isLoading`.

**C. Structured Output** (`src/lib/ai/structured.ts`)

Use Vercel AI SDK `generateObject` with a Zod schema. This ensures type-safe parsed output without manual JSON parsing.

**D. RAG (Retrieval-Augmented Generation)**

1. Search for relevant documents (using your search implementation)
2. Build context string from top-N results
3. Inject context into system or user prompt
4. Instruct model to cite sources and say "I don't know" when answer isn't in context

### 5. Define Prompt Templates (`src/lib/ai/prompts.ts`)

For each feature: define a typed `SYSTEM_PROMPTS` constant + a `[feature]Prompt(params)` builder function. System prompts should be concise and specific. Use few-shot examples for classification tasks. Use variable interpolation, never string concatenation in the system prompt itself.

### 6. Add Error Handling (`src/lib/ai/errors.ts`)

Custom `AIError(message, code, retryable)` class. `handleAIError(error)` maps provider API errors by HTTP status:

- `429` → `RATE_LIMITED` (retryable)
- `500/502/503` → `SERVICE_ERROR` (retryable)
- `401` → `AUTH_ERROR` (not retryable)

`withRetry<T>(fn, maxRetries=3, delayMs=1000)` — exponential-ish backoff, only retries when `retryable=true`.

### 7. Token Management (`src/lib/ai/tokens.ts`)

- `estimateTokens(text)` — fast rough estimate: `Math.ceil(text.length / 4)`
- `countTokens(text, model)` — accurate via `tiktoken` `encoding_for_model` (remember to call `.free()`)
- `truncateToTokenLimit(text, maxTokens)` — decode truncated token slice, append `'...'`

### Best Practices

| Do                                      | Don't                              |
| --------------------------------------- | ---------------------------------- |
| Stream for chat interfaces              | Block UI waiting for full response |
| Set `max_tokens` always                 | Allow unbounded generation         |
| Validate AI structured outputs with Zod | Trust AI output without validation |
| Degrade gracefully on AI errors         | Let AI errors crash the app        |
| Log prompts + responses (sanitized)     | Log sensitive user data            |

## Review Checklist

- [ ] AI SDK installed and configured
- [ ] API key validated at startup
- [ ] Streaming implemented for chat features
- [ ] System prompts defined and externalized
- [ ] Structured output uses Zod schemas
- [ ] Error handling with retries
- [ ] Token limits enforced

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Read `/docs/ai/feasibility-assessment.md` for use cases. Implement infrastructure first (client, errors, tokens), then one use case per iteration.

## Outputs

- [ ] `src/lib/ai/client.ts`
- [ ] `src/lib/ai/prompts.ts`
- [ ] `src/lib/ai/completions.ts`
- [ ] `src/lib/ai/structured.ts`
- [ ] `src/lib/ai/errors.ts`
- [ ] `src/lib/ai/tokens.ts`
- [ ] `src/app/api/chat/route.ts` (if chat feature)
- [ ] Updated `.env.example`

## Related SOPs

- **SOP-400:** AI Feasibility
- **SOP-402:** AI Testing
- **SOP-403:** Cost Monitoring
