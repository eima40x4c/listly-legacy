---
sop: "SOP-006"
title: "Code Style Standards"
phase: 0
iterative: false
prerequisites:
  - sop: "SOP-001"
    output: "/docs/tech-stack.md"
  - sop: "SOP-003"
    output: "/docs/architecture/project-structure.md"
outputs:
  - "eslint.config.js"
  - "prettier.config.js"
  - ".vscode/settings.json"
  - ".husky/pre-commit"
  - "lint-staged.config.js"
related: ["SOP-003", "SOP-005", "SOP-503"]
---

# SOP-006: Code Style Standards

## Purpose

Establish consistent code formatting, naming conventions, and style guidelines. Consistent style reduces cognitive load in reviews and prevents style-related merge conflicts.

## Scope

- **Covers:** Formatting, naming, file organization, comments
- **Excludes:** Architecture decisions (SOP-005), testing patterns (SOP-500)

## Prerequisites

- [ ] SOP-001 completed — tech stack known
- [ ] SOP-003 completed — project structure exists
- [ ] Editor/IDE configured

## Procedure

### 1. Install Tooling

```bash
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier \
  @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-import eslint-plugin-simple-import-sort \
  eslint-plugin-react eslint-plugin-react-hooks eslint-config-next \
  husky lint-staged
pnpm exec husky init
```

### 2. Create ESLint Configuration

→ template: `.sops/templates/code/eslint.config.js.template`

Key rules to enforce: `@typescript-eslint/no-unused-vars`, `@typescript-eslint/consistent-type-imports`, `react-hooks/rules-of-hooks`, `simple-import-sort/imports`, `no-console` (warn), `prefer-const`.

### 3. Create Prettier Configuration

Standard settings: `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: 'es5'`, `printWidth: 80`, `endOfLine: 'lf'`.

### 4. Apply Naming Conventions

| Type             | Convention                 | Example                 |
| ---------------- | -------------------------- | ----------------------- |
| Variables        | camelCase                  | `userName`, `isLoading` |
| Constants        | SCREAMING_SNAKE            | `MAX_RETRIES`           |
| Functions        | camelCase, verb prefix     | `getUserById`           |
| Classes          | PascalCase                 | `UserService`           |
| Interfaces/Types | PascalCase (no `I` prefix) | `User`, `ApiResponse`   |
| Enums            | PascalCase                 | `UserRole`              |
| Components       | PascalCase                 | `UserCard`              |
| Hooks            | camelCase, `use` prefix    | `useAuth`               |
| Component files  | PascalCase                 | `Button.tsx`            |
| Utility files    | kebab-case                 | `date-utils.ts`         |

### 5. Enforce Import Order

Order: (1) React/Next.js → (2) external packages → (3) internal aliases (`@/`) → (4) relative imports. Handled automatically by `simple-import-sort`.

### 6. Comment Standards

- Write comments that explain **why**, not what
- Use JSDoc (`/** */`) for all exported public functions
- TODOs must include author and context: `// TODO(name): reason (target date)`

### 7. Set Up Git Hooks

`.husky/pre-commit` must run `pnpm lint-staged` before each commit.

### 8. Add lint/format Scripts to `package.json`

Required: `lint`, `lint:fix`, `format`, `format:check`, `type-check`.

## Review Checklist

- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Import sorting enabled
- [ ] Naming conventions documented
- [ ] VS Code settings added
- [ ] Git hooks set up (`husky` + `lint-staged`)
- [ ] Team aligned on conventions

## AI Agent Prompt

→ Use **Pattern 1** from `.prompts/AI-GUIDE.md`. No prerequisite files need to be re-read — use context cache in `AI-SESSION.md`.

## Outputs

- [ ] `eslint.config.js`
- [ ] `prettier.config.js`
- [ ] `.vscode/settings.json` and `.vscode/extensions.json`
- [ ] `.husky/pre-commit`
- [ ] `lint-staged.config.js`

## Related SOPs

- **SOP-003:** Project Structure
- **SOP-005:** Design Patterns
- **SOP-503:** Code Review
