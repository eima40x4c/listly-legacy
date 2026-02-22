---
sop: "SOP-302"
title: "UI/UX Design & Planning"
phase: 3
iterative: true
prerequisites:
  - sop: "SOP-000"
    output: "/docs/requirements.md"
  - sop: "SOP-300"
    output: "src/components/"
  - sop: "SOP-301"
    output: "tailwind.config.ts"
outputs:
  - "/docs/frontend/ui-analysis.md"
  - "/docs/frontend/ui-design/[feature].md"
  - "/docs/frontend/visual-design.md"
related: ["SOP-000", "SOP-300", "SOP-301", "SOP-305"]
---

# SOP-302: UI/UX Design & Planning

## Purpose

Plan and design the user interface before implementation. Bridges requirements to code by producing wireframes, flows, and component breakdowns — intentionally designed and human-approved before building begins.

## Scope

- **Covers:** Wireframes, user flows, component hierarchy, interaction specs, visual design direction
- **Excludes:** Figma tooling, component implementation (SOP-300), page building (SOP-305)

## Prerequisites

- [ ] SOP-000 completed — user stories defined
- [ ] SOP-300 completed — component patterns understood
- [ ] SOP-301 completed — design tokens/theme defined

## Procedure

**Iterative — repeat for each feature or screen group.**

### 1. Assess Developer Design Input Level

Ask the developer which mode applies:

- **Minimal** — Design from scratch based on user stories only
- **Moderate** — Refine rough sketches or descriptions provided
- **Detailed** — Create implementation plan from existing Figma/designs

### 2. Analyze User Stories for UI Implications

Create `/docs/frontend/ui-analysis.md`. For each user story: map to needed UI elements, components, and interactions. Note accessibility and responsive behavior requirements.

### 3. Create User Flows

Document key user journeys using a simple text-based flow diagram (steps → decision points → success/error states). Cover: the primary happy path, the main error path, and any branching decision points.

### 4. Design Text-Based Wireframes

For each screen, produce an ASCII/text wireframe showing:

- Header / navigation bar structure
- Primary content area and component placement
- Key modals / dialogs
- Mobile layout (default) and note desktop differences

### 5. Define Component Hierarchy

For each wireframe, produce a component tree: `Page → Layout → FeatureComponent → UIComponent`.

### 6. Specify Micro-Interactions

For each key interaction, document: trigger, duration/easing, visual effects sequence, success/error feedback.

### 7. Define Responsive Breakpoints

For each screen, document layout differences at `<640px` (mobile), `640–1024px` (tablet), `>1024px` (desktop).

### 8. List Accessibility Requirements

Per screen: keyboard navigation flow (tab order, escape targets), ARIA landmark roles, live region requirements, contrast constraints.

### 9. Propose Visual Design Direction

> ⚠️ **Hard Gate:** Agent proposes options; human must approve before proceeding to SOP-305.

Propose 2–3 color palette options with: primary, secondary, background, surface, text, muted, error, success. Propose typography (heading/body font, sizes, weights). Propose visual mood (border radius, spacing density, shadow style, dark mode support).

Record approved design in `/docs/frontend/visual-design.md`.

## Review Checklist

- [ ] User stories analyzed for UI implications
- [ ] User flows documented for key journeys
- [ ] Text wireframes created for each screen
- [ ] Component hierarchy defined
- [ ] Interactions specified
- [ ] Responsive breakpoints documented
- [ ] Accessibility requirements listed
- [ ] **Visual design direction approved by developer ← GATE**

## AI Agent Prompt

→ Use **Pattern 3 (Iterative)** from `.prompts/AI-GUIDE.md`. Read `/docs/requirements.md` for user stories. Design one feature group per iteration. **Do not proceed to SOP-305 until human approves the visual design.**

## Outputs

- [ ] `/docs/frontend/ui-analysis.md`
- [ ] `/docs/frontend/ui-design/[feature].md` (per feature)
- [ ] `/docs/frontend/visual-design.md` (approved)

## Related SOPs

- **SOP-000:** Requirements
- **SOP-300:** Component Architecture
- **SOP-301:** Styling Standards
- **SOP-305:** Page Implementation
