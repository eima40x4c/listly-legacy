---
sop: "SOP-402"
title: "AI Testing"
phase: 4
iterative: false
prerequisites:
  - sop: "SOP-401"
    output: "src/lib/ai/"
  - sop: "SOP-500"
    output: "tests/"
outputs:
  - "src/lib/ai/__mocks__/client.ts"
  - "tests/ai/*.test.ts"
  - "tests/evals/*.ts"
related: ["SOP-401", "SOP-500", "SOP-501"]
---

# SOP-402: AI Testing

## Purpose

Establish testing strategies for AI features given their non-deterministic nature, high API cost, and quality-is-subjective challenges.

## Scope

- **Covers:** Mocked unit tests, prompt construction tests, schema validation, evaluation sets, integration stubs
- **Excludes:** Load testing at scale, model training evaluation

## Prerequisites

- [ ] SOP-401 completed — AI features implemented
- [ ] SOP-500 patterns understood — test runner configured

## Testing Pyramid

| Layer                 | What                                                | Frequency         | Cost   |
| --------------------- | --------------------------------------------------- | ----------------- | ------ |
| **Unit (mocked)**     | Prompt construction, output parsing, error handling | Every commit      | ≈ free |
| **Schema validation** | Zod schema contract tests                           | Every commit      | free   |
| **Eval sets**         | Quality benchmarks over golden examples             | On prompt changes | Medium |
| **Integration**       | Real API smoke test                                 | Weekly / manual   | $      |
| **Human review**      | Outputs reviewed by people                          | Quarterly         | —      |

## Procedure

### 1. Create AI Client Mock (`src/lib/ai/__mocks__/client.ts`)

Export `mockOpenAI` with `jest.fn()` on `chat.completions.create`. Export `mockCompletion(content)` helper that returns a valid OpenAI response shape including `usage` tokens. Use `jest.mock('@/lib/ai/client', () => ({ openai: mockOpenAI, DEFAULT_MODEL: '...' }))` in tests.

### 2. Unit Test Prompt Construction (`tests/ai/prompts.test.ts`)

Test that each `[feature]Prompt(params)` builder:

- Includes all required parameter values in the output string
- Formats lists correctly (bullet points, numbered, etc.)
- Contains required instruction keywords (categories, constraints)

These tests are deterministic and free.

### 3. Unit Test Completion Function (`tests/ai/completions.test.ts`)

Using the mock: verify `chat.completions.create` is called with the exact model, message structure, `max_tokens`, and `temperature`. Verify edge cases: `null` content returns `''`, error propagates as `AIError`, retry logic calls API multiple times.

### 4. Test Structured Output Schemas (`tests/ai/structured.test.ts`)

Test Zod schemas directly without any API calls:

- Valid response objects pass without throwing
- Invalid enum values throw
- Out-of-range numbers throw
- Missing required fields throw

### 5. Create Evaluation Sets (`tests/evals/[feature]-eval.ts`)

For each AI feature, define a golden dataset of `EvalCase[]`: `{ input, expectedOutput, minConfidence? }`. Implement `run[Feature]Eval()` that calls the real AI and returns `{ results, passRate, passed }` with a defined acceptance threshold (e.g., 90%).

> **Expensive:** Never run evals in the standard test suite. Run manually or in separate CI job on prompt changes.

### 6. Fixture Responses (`tests/fixtures/ai-responses.ts`)

For complex integration scenarios, store canned API response objects (with correct shape including `usage` fields). Reuse across test files via `mockOpenAI.create.mockResolvedValue(chatResponses.greeting)`.

### 7. Integration Test Stubs (`.skip()`)

Write real integration tests but wrap in `describe.skip(...)`. Set `jest.setTimeout(30000)`. Document how to run manually: `TEST_AI=true pnpm test -- --testPathPattern ai.integration`. These verify streaming, structured output, and rate limit handling against the real API.

### 8. CI Configuration

Unit and schema tests: always run. Integration tests: only run when `TEST_AI=true` env flag set. Add comment in CI config explaining this cost control.

## Review Checklist

- [ ] AI client mock created
- [ ] Prompt construction unit-tested
- [ ] Completion function unit-tested (success + edge cases)
- [ ] Zod schema contracts tested
- [ ] Evaluation sets created for key features
- [ ] Integration tests exist but skip by default
- [ ] CI only runs cheap tests by default

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. Read `src/lib/ai/` for all implemented AI functions and their schemas. Create mocks and tests for all functions.

## Outputs

- [ ] `src/lib/ai/__mocks__/client.ts`
- [ ] `tests/ai/prompts.test.ts`
- [ ] `tests/ai/completions.test.ts`
- [ ] `tests/ai/structured.test.ts`
- [ ] `tests/evals/[feature]-eval.ts`
- [ ] `tests/fixtures/ai-responses.ts`

## Related SOPs

- **SOP-401:** LLM Integration
- **SOP-500:** Unit Testing
- **SOP-501:** Integration Testing
