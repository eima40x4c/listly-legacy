---
sop: "SOP-301"
title: "Styling Standards"
phase: 3
iterative: false
prerequisites:
  - sop: "SOP-003"
    output: "/docs/architecture/project-structure.md"
  - sop: "SOP-300"
    output: "src/components/"
outputs:
  - "tailwind.config.ts"
  - "src/app/globals.css"
  - "src/lib/utils.ts"
  - "src/components/ThemeProvider.tsx"
related: ["SOP-300", "SOP-006", "SOP-304"]
---

# SOP-301: Styling Standards

## Purpose

Establish consistent styling practices ensuring visual coherence, maintainability, and responsive design.

## Scope

- **Covers:** Tailwind CSS configuration, CSS variables, theming, dark mode, responsive breakpoints, accessibility
- **Excludes:** Component logic (SOP-300)

## Prerequisites

- [ ] SOP-003 completed — project structure exists
- [ ] SOP-300 completed — component patterns defined

## Procedure

### 1. Install Dependencies

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm add clsx tailwind-merge class-variance-authority next-themes
npx tailwindcss init -p
```

### 2. Configure Tailwind (`tailwind.config.ts`)

→ template: `.sops/templates/code/tailwind.config.ts.template`

Key configuration: `darkMode: 'class'`, content paths covering `src/app/**` and `src/components/**`, extend theme with CSS variable-based colors (`background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `card`, `destructive`, `border`, `input`, `ring`), `borderRadius` using `var(--radius)`, `fontFamily` from CSS variables, custom keyframes (`fade-in`, `slide-in`).

### 3. Set Up CSS Variables (`src/app/globals.css`)

→ template: `.sops/templates/code/globals.css.template`

Define `:root` (light) and `.dark` HSL color values for every Tailwind CSS variable token. Apply `@apply border-border` globally and `@apply bg-background text-foreground` to `body`.

### 4. Create Utility Functions (`src/lib/utils.ts`)

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5. Set Up Component Variants with `cva`

Create `src/lib/cva.ts` re-exporting from `class-variance-authority` and define shared variant sets (e.g., `buttonVariants` with `variant: primary|secondary|destructive|outline|ghost|link` and `size: sm|md|lg|icon`).

### 6. Responsive Design — Use Mobile-First

- Default style targets mobile; use `md:` / `lg:` prefixes to override for larger screens
- Standard breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px
- Minimum touch targets: 44×44px

### 7. Implement Dark Mode

Create `src/components/ThemeProvider.tsx` wrapping `next-themes` `ThemeProvider` with `attribute="class" defaultTheme="system" enableSystem`. Wrap root layout. Create `ThemeToggle.tsx` component using `useTheme()`.

### 8. Accessibility Standards in Styling

- All interactive elements: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Screen-reader text: `sr-only` class
- Respect reduced motion: `motion-reduce:transition-none` on all transitions
- Color contrast: always use paired foreground/background tokens (never hardcoded colors)

## Review Checklist

- [ ] Tailwind CSS installed and configured
- [ ] CSS variables for all color tokens set up (light + dark)
- [ ] `cn()` utility function created
- [ ] `cva` variants configured for Button
- [ ] Mobile-first responsive approach followed
- [ ] Dark mode implemented
- [ ] Focus states visible on all interactive elements
- [ ] Accessibility requirements met

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. No prerequisite files to re-read — use context cache for project-specific color palette (from visual design decisions in SOP-302).

## Outputs

- [ ] `tailwind.config.ts`
- [ ] `src/app/globals.css`
- [ ] `src/lib/utils.ts`
- [ ] `src/lib/cva.ts`
- [ ] `src/components/ThemeProvider.tsx`
- [ ] `src/components/ThemeToggle.tsx`

## Related SOPs

- **SOP-300:** Component Architecture
- **SOP-006:** Code Style Standards
- **SOP-304:** Form Handling
