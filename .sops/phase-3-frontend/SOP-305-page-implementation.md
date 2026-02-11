# SOP-305: Page Implementation

## Purpose

Implement complete pages that compose components, integrate with APIs, manage page-level state, and deliver the user experience designed in SOP-302. This SOP bridges individual components (SOP-300) with the full user-facing screens of the application.

---

## Scope

- **Applies to:** All user-facing pages and screens
- **Covers:** Page components, layouts, data fetching, state management, navigation
- **Does not cover:** Reusable components (SOP-300), API client setup (SOP-303), forms (SOP-304)

---

## Prerequisites

- [ ] SOP-302 (UI/UX Design) — Wireframes and component hierarchy approved
- [ ] SOP-300 (Component Architecture) — Required components built
- [ ] SOP-303 (API Integration) — API hooks/clients ready
- [ ] SOP-304 (Form Handling) — Form components ready (if needed)

---

## Procedure

### 1. Page Planning Document

Create `/docs/frontend/pages/[page-name].md`:

```markdown
# Page: [Entity] Detail

## Overview

- **Route:** `/[entities]/[id]`
- **Purpose:** Display and manage a single [entity] with related data
- **Wireframe:** See `/docs/frontend/ui-design/[entity]-detail.md`

## Data Requirements

| Data             | Source                            | Loading State  | Error State  |
| ---------------- | --------------------------------- | -------------- | ------------ |
| [Entity] details | `GET /api/[entities]/:id`         | Skeleton       | 404 page     |
| Related items    | `GET /api/[entities]/:id/related` | Item skeletons | Retry button |
| User permissions | Derived from [entity].ownerId     | N/A            | N/A          |

## State Management

| State             | Type        | Scope | Persistence  |
| ----------------- | ----------- | ----- | ------------ |
| selectedItems     | Set<string> | Page  | None         |
| expandedSections  | Set<string> | Page  | localStorage |
| isEditing         | boolean     | Page  | None         |
| optimisticUpdates | [Entity][]  | Page  | None         |

## User Interactions

| Action      | Handler       | API Call                          | Optimistic Update |
| ----------- | ------------- | --------------------------------- | ----------------- |
| Update item | handleUpdate  | PATCH /api/[entities]/:id         | Yes               |
| Add related | handleAdd     | POST /api/[entities]/:id/related  | Yes               |
| Delete item | handleDelete  | DELETE /api/[entities]/:id        | Yes               |
| Reorder     | handleReorder | PATCH /api/[entities]/:id/reorder | Yes               |

## Components Used

- Header (with BackButton, EditableTitle, MenuDropdown)
- [Primary]Input
- [Section] (repeated)
- [ItemCard] (repeated)
- BottomNav / Sidebar
- LoadingSkeleton
- ErrorBoundary
```

### 2. Create Page Component Structure

Standard Next.js App Router page structure:

```typescript
// app/[entities]/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { [Entity]PageContent } from './[entity]-page-content';
import { [Entity]PageSkeleton } from './[entity]-page-skeleton';
import { get[Entity] } from '@/lib/api/[entities]';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Metadata generation
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const entity = await get[Entity](id).catch(() => null);

  return {
    title: entity ? `${entity.name} | [App Name]` : '[Entity] Not Found',
    description: entity?.description || 'Manage your [entity]',
  };
}

// Page component
export default async function [Entity]Page({ params }: PageProps) {
  const { id } = await params;

  // Validate entity exists (for 404)
  const entity = await get[Entity](id).catch(() => null);
  if (!entity) {
    notFound();
  }

  return (
    <Suspense fallback={<[Entity]PageSkeleton />}>
      <[Entity]PageContent entityId={id} initialData={entity} />
    </Suspense>
  );
}
```

### 3. Implement Page Content Component

Separate client component for interactivity:

```typescript
// app/[entities]/[id]/[entity]-page-content.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { use[Entity], useUpdate[Entity], useDelete[Entity] } from '@/hooks/use-[entity]';
import { Header } from '@/components/layout/header';
import { [Primary]Input } from '@/components/[entities]/[primary]-input';
import { [Section] } from '@/components/[entities]/[section]';
import { Navigation } from '@/components/layout/navigation';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import type { [Entity] } from '@/types';

interface [Entity]PageContentProps {
  entityId: string;
  initialData: [Entity];
}

export function [Entity]PageContent({ entityId, initialData }: [Entity]PageContentProps) {
  // Server state (React Query)
  const { data, isLoading, error, refetch } = use[Entity](entityId);

  // Mutations
  const updateEntity = useUpdate[Entity](entityId);
  const deleteEntity = useDelete[Entity](entityId);

  // Local UI state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(['section1', 'section2']) // Default expanded
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Derived state
  const groupedData = useMemo(() => {
    if (!data?.relatedItems) return {};
    return groupByCategory(data.relatedItems);
  }, [data?.relatedItems]);

  // Handlers
  const handleUpdate = useCallback(async (updates: Partial<[Entity]>) => {
    await updateEntity.mutateAsync(updates);
  }, [updateEntity]);

  const handleDelete = useCallback(async () => {
    await deleteEntity.mutateAsync();
  }, [deleteEntity]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Error state
  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={refetch}
        message="Failed to load data"
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Header
        title={initialData.name}
        editable
        onTitleChange={(name) => handleUpdate({ name })}
        backHref="/[entities]"
        actions={[
          { icon: 'share', label: 'Share', onClick: () => {/* open share modal */} },
          { icon: 'more', label: 'More', onClick: () => {/* open menu */} },
        ]}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {/* Primary Input */}
        <div className="sticky top-0 z-10 bg-background p-4 border-b">
          <[Primary]Input
            onSubmit={handleAdd}
            isLoading={addMutation.isPending}
            placeholder="Add item..."
          />
        </div>

        {/* Content Sections */}
        <div className="p-4 space-y-4">
          {Object.entries(groupedData).map(([category, items]) => (
            <[Section]
              key={category}
              title={category}
              items={items}
              isExpanded={expandedSections.has(category)}
              onToggle={() => toggleSection(category)}
              onItemAction={handleItemAction}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && data?.relatedItems?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">
              No items yet
            </p>
            <p className="text-sm text-muted-foreground">
              Add items using the input above
            </p>
          </div>
        )}
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
```

### 4. Create Loading Skeleton

Implement proper loading states:

```typescript
// app/[entities]/[id]/[entity]-page-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function [Entity]PageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="h-14 border-b flex items-center px-4 gap-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-40" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-b">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Content Skeletons */}
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background">
        <div className="flex justify-around items-center h-full">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. Implement Error Handling

Create error and not-found pages:

```typescript
// app/[entities]/[id]/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function [Entity]NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-2">[Entity] Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center">
        This [entity] doesn't exist or you don't have access to it.
      </p>
      <Button asChild>
        <Link href="/[entities]">Back to [Entities]</Link>
      </Button>
    </div>
  );
}
```

```typescript
// app/[entities]/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function [Entity]Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('[Entity] page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 text-center">
        We couldn't load this page. Please try again.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
```

### 6. Layout Components

Create shared layouts:

```typescript
// app/[entities]/layout.tsx
import { Navigation } from '@/components/layout/navigation';
import { Toaster } from '@/components/ui/toaster';

export default function [Entities]Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <Navigation />
      <Toaster />
    </div>
  );
}
```

### 7. Page State Management Patterns

Document state patterns used:

```typescript
// hooks/use-[entity]-page-state.ts
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useState, useCallback } from 'react';

interface [Entity]PageState {
  expandedSections: Set<string>;
  sortBy: 'category' | 'date' | 'name';
  showArchived: boolean;
}

export function use[Entity]PageState(entityId: string) {
  // Persisted preferences
  const [preferences, setPreferences] = useLocalStorage(
    `[entity]-prefs-${entityId}`,
    {
      sortBy: 'category' as const,
      showArchived: false,
    }
  );

  // Session state (resets on page refresh)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['section1', 'section2'])
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const setSortBy = useCallback((sortBy: [Entity]PageState['sortBy']) => {
    setPreferences(prev => ({ ...prev, sortBy }));
  }, [setPreferences]);

  return {
    expandedSections,
    toggleSection,
    sortBy: preferences.sortBy,
    setSortBy,
    showArchived: preferences.showArchived,
    setShowArchived: (show: boolean) =>
      setPreferences(prev => ({ ...prev, showArchived: show })),
  };
}
```

### 8. Navigation & Routing

Handle navigation patterns:

```typescript
// lib/navigation.ts
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function use[Entity]Navigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateTo[Entity] = useCallback((entityId: string) => {
    router.push(`/[entities]/${entityId}`);
  }, [router]);

  const navigateToRelated = useCallback((entityId: string, relatedId: string) => {
    router.push(`/[entities]/${entityId}?item=${relatedId}`);
  }, [router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  // Get highlighted item from URL
  const highlightedItemId = searchParams.get('item');

  return {
    navigateTo[Entity],
    navigateToRelated,
    goBack,
    highlightedItemId,
  };
}
```

---

## File Structure

```
app/
├── [entities]/
│   ├── page.tsx                    # Entity index/list
│   ├── layout.tsx                  # Shared layout
│   ├── loading.tsx                 # Index loading
│   └── [id]/
│       ├── page.tsx                # Entity detail (server)
│       ├── [entity]-page-content.tsx   # Entity detail (client)
│       ├── [entity]-page-skeleton.tsx  # Loading skeleton
│       ├── not-found.tsx           # 404 state
│       └── error.tsx               # Error boundary
```

---

## Review Checklist

- [ ] Page server component handles data fetching
- [ ] Client component handles interactivity
- [ ] Loading skeleton matches final layout
- [ ] Error boundaries at appropriate levels
- [ ] Not found page for invalid routes
- [ ] Metadata generated for SEO
- [ ] Layout shares common UI elements
- [ ] Navigation patterns implemented
- [ ] State management follows patterns (server vs client)
- [ ] Accessibility maintained across states

---

## AI Agent Prompt Template

```markdown
Execute SOP-305 (Page Implementation):

Read:

- `/docs/frontend/ui-design/[feature].md` for wireframes
- `/docs/frontend/pages/[page].md` for page planning
- `src/components/` for available components
- `src/hooks/` for available hooks

**Tasks:**

1. Create page planning document
2. Implement server component (`page.tsx`)
3. Implement client content component
4. Create loading skeleton
5. Add error and not-found pages
6. Set up layout if needed
7. Implement page-level state management
8. Wire up navigation

**Key principles:**

- Server components for data fetching
- Client components for interactivity
- Optimistic updates for better UX
- Proper loading and error states
- Replace [Entity] placeholders with your actual domain entities
```

---

## Outputs

- [ ] `/docs/frontend/pages/[page].md` — Page planning document
- [ ] `app/[route]/page.tsx` — Server component
- [ ] `app/[route]/[page]-content.tsx` — Client component
- [ ] `app/[route]/loading.tsx` or skeleton component
- [ ] `app/[route]/error.tsx` — Error boundary
- [ ] `app/[route]/not-found.tsx` — 404 page
- [ ] `app/[route]/layout.tsx` — Shared layout (if needed)

---

## Related SOPs

- **SOP-302:** UI/UX Design (wireframes and specs)
- **SOP-300:** Component Architecture (reusable components)
- **SOP-303:** API Integration (data fetching hooks)
- **SOP-304:** Form Handling (form components)
- **SOP-306:** PWA (offline support)
