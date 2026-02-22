---
sop: "SOP-304"
title: "Form Handling"
phase: 3
iterative: true
prerequisites:
  - sop: "SOP-300"
    output: "src/components/ui/"
  - sop: "SOP-206"
    output: "src/validators/"
outputs:
  - "src/components/ui/Form/"
  - "src/hooks/useZodForm.ts"
related: ["SOP-300", "SOP-206", "SOP-303"]
---

# SOP-304: Form Handling

## Purpose

Implement consistent, accessible form handling with schema-driven client validation, clear error display, and loading/success feedback.

## Scope

- **Covers:** React Hook Form setup, Zod integration, Form UI components, submission patterns
- **Excludes:** Backend validation (SOP-206), API design (SOP-202)

## Prerequisites

- [ ] SOP-300 completed — UI component structure in place
- [ ] SOP-206 completed — Zod schemas exist in `src/validators/`

## Procedure

### 1. Install Dependencies

```bash
pnpm add react-hook-form @hookform/resolvers
pnpm add @radix-ui/react-select   # For styled Select component
```

### 2. Create Form UI Components (`src/components/ui/Form/`)

Required components (all use `react-hook-form` context internally):

- `Form` — re-exports `FormProvider`
- `FormField` — provides `name` context via React context
- `FormItem` — wrapper div with `space-y-2`
- `FormLabel` — label that turns red when field has error
- `FormControl` — div with `aria-invalid` and `aria-describedby` wired to error ID
- `FormDescription` — muted helper text
- `FormMessage` — displays `error.message` with id `${fieldName}-error`

### 3. Create `useZodForm` Hook (`src/hooks/useZodForm.ts`)

Thin wrapper around `useForm` that pre-configures `zodResolver`:

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps } from "react-hook-form";
import type { ZodSchema, z } from "zod";

export function useZodForm<TSchema extends ZodSchema>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">,
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...options,
  });
}
```

### 4. Implement Forms (Iterative — one form per iteration)

For each form in the application:

1. Import the matching Zod schema from `src/validators/`
2. Call `useZodForm(schema, { defaultValues })` to initialize
3. Compose using `<Form {...form}><form onSubmit={form.handleSubmit(onSubmit)}>`
4. Each field: `<FormField name="..."><FormItem><FormLabel /><FormControl><Input .../></FormControl><FormMessage /></FormItem></FormField>`
5. Use `<Controller>` for non-native inputs (Select, DatePicker, etc.)
6. Submission: call API mutation; on error set form errors; on success show toast + navigate

### 5. Server Action Forms (Next.js, if applicable)

Use `useFormState` + `useFormStatus` for progressive-enhancement forms. Schema validation happens in the server action via `schema.safeParse(formData.entries())`. Return typed `{ errors, message, success }` state.

### 6. Form UX Standards

- Show field errors inline below each input (never at top of form only)
- Disable submit button during pending state (`form.formState.isSubmitting`)
- Show loading spinner in submit button while pending
- On success: toast notification + redirect or form reset
- On API error: parse error response and either `form.setError('root', message)` or toast

## Review Checklist

- [ ] `react-hook-form` and Zod resolver installed
- [ ] Form UI components created (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
- [ ] `useZodForm` hook implemented
- [ ] All forms validate on submit with inline field errors
- [ ] Loading state shown on submit button
- [ ] Success feedback (toast + redirect) on successful submission
- [ ] API errors handled and displayed

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Set up Form infrastructure first (components + hook), then implement one form per iteration. Read Zod schemas from `src/validators/` to avoid duplicating validation logic.

## Outputs

- [ ] `src/components/ui/Form/index.ts` and components
- [ ] `src/hooks/useZodForm.ts`
- [ ] One form component per feature form

## Related SOPs

- **SOP-300:** Component Architecture
- **SOP-206:** Validation (Zod schemas)
- **SOP-303:** API Integration (mutations called from forms)
