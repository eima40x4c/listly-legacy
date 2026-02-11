# Interactions & Accessibility

**Status:** ✅ Complete  
**Last Updated:** February 11, 2026  
**SOP:** 302 - UI/UX Design

---

## Overview

This document specifies micro-interactions, animations, gestures, and accessibility requirements for the Listly application. All interactions follow WCAG 2.1 Level AA standards.

---

## Core Interactions

### 1. Item Check/Uncheck (Shopping Mode)

**Trigger:** Tap/click item or checkbox

**Animation:**

```
Duration: 300ms ease-out

State Transition:
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ ○ Item      │ ───► │ Checking... │ ───► │ ✓ Item      │
│   $4.50     │      │   $4.50     │      │   $4.50     │
└─────────────┘      └─────────────┘      └─────────────┘
                           ↓
                     [Haptic pulse]
                           ↓
                    ┌─────────────┐
                    │ Strike-thru │
                    │ Fade 50%    │
                    │ Move bottom │
                    └─────────────┘
```

**Effects:**

1. **0-100ms:** Checkbox fills with primary color
2. **100-200ms:** Checkmark draws in
3. **200-300ms:** Text strikes through, opacity 50%
4. **300ms:** Item moves to "checked items" section (slide down)
5. **Haptic:** Single tap feedback (mobile)
6. **Toast:** "Undo" button appears for 3 seconds

**Accessibility:**

- Screen reader: "Milk, checked. Added to completed items. Undo button available."
- Keyboard: Space/Enter to toggle
- Focus: Remains on item after check

---

### 2. Add Item

**Trigger:** Submit item input (Enter key / Tap add button / Select autocomplete)

**Animation:**

```
Duration: 400ms ease-out

Input State:
┌─────────────────────────┐      ┌─────────────────────────┐
│ Milk_                   │ ───► │                         │
│                    [+]  │      │                    [+]  │
└─────────────────────────┘      └─────────────────────────┘
                                        ↓ [Clear input]
List State:
                                 ┌─────────────┐
                                 │ [Slide in]  │
                                 │ ○ Milk      │ ← New item
                                 │ Added by You│
                                 └─────────────┘
```

**Effects:**

1. **0ms:** Input value validated
2. **0-100ms:** Success pulse animation on add button
3. **100ms:** Input clears with fade out
4. **100-400ms:** New item slides in from top with fade in
5. **200ms:** Auto-categorize and move to category section
6. **Haptic:** Success vibration (mobile)
7. **Toast:** "Milk added" (brief, 1.5 seconds)

**Accessibility:**

- Screen reader: "Milk added to Dairy category"
- Keyboard: Focus remains on input for next item
- Error: Red outline + error message if validation fails

---

### 3. Swipe to Delete (Mobile)

**Trigger:** Swipe left on item (≥40% width)

**Animation:**

```
Duration: 250ms ease-out

Swipe Progress:
┌─────────────────────────┐
│ ○ Milk         │🗑️│     │ ← Reveal delete
│   $4.50        │  │     │
└─────────────────────────┘
        ← Swipe

Threshold: 40% of width
< 40%: Spring back
≥ 40%: Complete delete
```

**Effects:**

1. **During swipe:** Red background reveals with delete icon
2. **< 40%:** Elastic spring back to original position
3. **≥ 40%:** Continue slide off screen
4. **250ms:** Item fades out and removes from DOM
5. **Haptic:** Warning vibration at 40% threshold
6. **Toast:** "Item deleted" with "Undo" button (5 seconds)

**Accessibility:**

- Alternative: Long-press reveals context menu with "Delete"
- Keyboard: Delete key when item focused
- Screen reader: "Swipe left to delete, or press delete key"

---

### 4. Drag to Reorder (Edit Mode)

**Trigger:** Long-press (mobile) / Click-drag (desktop) on drag handle

**Animation:**

```
Duration: Follows cursor/finger

Lift Effect:
┌─────────────────────────┐      ┌─────────────────────────┐
│ [☰] ○ Milk              │ ───► │ [☰] ○ Milk        [lift]│
│         $4.50           │      │         $4.50     shadow│
└─────────────────────────┘      └─────────────────────────┘
                                        ↓ [Move]
                                 ┌─────────────────────────┐
                                 │ [Placeholder line]      │
                                 └─────────────────────────┘
```

**Effects:**

1. **Long-press 500ms:** Item lifts with shadow and scale (1.05x)
2. **During drag:** Other items shift to make space (200ms ease-in-out)
3. **Placeholder:** Dashed line shows drop position
4. **Drop:** Item settles into new position (200ms ease-out)
5. **Haptic:** Selection vibration on lift, confirmation on drop

**Accessibility:**

- Keyboard: Focus item, press Space to enter drag mode, Arrow keys to move, Space to drop
- Screen reader: "Milk, position 1 of 5. Press Space to grab, Arrow keys to move."
- Focus: Visible outline during drag mode

---

### 5. Pull to Refresh

**Trigger:** Pull down from top of scrollable list (≥80px)

**Animation:**

```
Duration: 300ms ease-out

Pull Progress:
┌─────────────────────────┐
│         ↓↓↓             │ ← Pull indicator
│     (Threshold)         │
├─────────────────────────┤
│ List content...         │
└─────────────────────────┘

Threshold: 80px
< 80px: Spring back
≥ 80px: Trigger refresh
```

**Effects:**

1. **0-80px:** Spinner icon rotates proportionally
2. **80px:** Haptic tick, icon fills with primary color
3. **Release:** Spinner animates, "Refreshing..." text
4. **On complete:** Success checkmark (500ms), then fade out

**Accessibility:**

- Alternative: Refresh button in header (always visible)
- Screen reader: "Pull down to refresh, or use refresh button"
- Keyboard: Ctrl+R / Cmd+R triggers refresh

---

### 6. Modal Open/Close

**Trigger:** Tap button / Close button / Escape key / Backdrop click

**Animation:**

```
Duration: 250ms ease-out

Open:
Backdrop: 0% → 40% opacity (black)
Modal: Scale 0.9 → 1.0 + Fade 0 → 100%

Close:
Modal: Scale 1.0 → 0.9 + Fade 100% → 0%
Backdrop: 40% → 0% opacity
```

**Effects:**

1. **Open:**
   - 0ms: Backdrop fades in
   - 50ms: Modal scales up and fades in
   - 250ms: Complete, focus moves to first input
   - Body: Scroll locked
2. **Close:**
   - 0ms: Modal scales down and fades out
   - 150ms: Backdrop fades out
   - 250ms: Complete, focus returns to trigger button
   - Body: Scroll unlocked

**Accessibility:**

- Focus trap: Tab cycles within modal
- Escape: Closes modal, returns focus
- Screen reader: "Dialog opened. Close with Escape key."
- Backdrop: Labeled "Close dialog"

---

### 7. Autocomplete Suggestions

**Trigger:** Type in input field (debounced 200ms)

**Animation:**

```
Duration: 200ms ease-out

Show:
┌─────────────────────────┐
│ mil_                    │
└─────────────────────────┘
          ↓ [Fade in]
┌─────────────────────────┐
│ ○ Whole Milk            │ ← Suggestions
│ ○ Almond Milk           │
│ ○ Oat Milk              │
└─────────────────────────┘
```

**Effects:**

1. **Debounce:** Wait 200ms after last keystroke
2. **Show:** Dropdown fades in below input (200ms)
3. **Highlight:** First item auto-highlighted
4. **Arrow keys:** Move highlight with smooth transition (100ms)
5. **Hover:** Highlight on mouse over
6. **Select:** Fade out dropdown, fill input

**Accessibility:**

- ARIA: `role="combobox"`, `aria-expanded`, `aria-activedescendant`
- Screen reader: "5 suggestions available. Use arrow keys to navigate."
- Keyboard: Arrow up/down to navigate, Enter to select, Escape to close
- Focus: Visible highlight on selected suggestion

---

### 8. Budget Progress Update

**Trigger:** Check item with price / Enter price

**Animation:**

```
Duration: 500ms ease-out

Progress Bar:
┌─────────────────────────┐
│ Budget: $50.00          │
│ Spent: $12.49           │
│ ▰▰▰▱▱▱▱▱▱▱ 25%        │
└─────────────────────────┘
          ↓ [Add $4.50]
┌─────────────────────────┐
│ Budget: $50.00          │
│ Spent: $16.99           │ ← Count up
│ ▰▰▰▰▱▱▱▱▱▱ 34%        │ ← Grow bar
└─────────────────────────┘
```

**Effects:**

1. **0-300ms:** Spent amount counts up from old to new value
2. **0-500ms:** Progress bar smoothly grows to new percentage
3. **Color change:** Green → Yellow (>80%) → Red (>100%)
4. **>100%:** Warning badge pulses (3 pulses, 200ms each)

**Accessibility:**

- ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Screen reader: "Budget progress, 34%, $16.99 of $50.00 spent"
- Visual: High contrast colors for red warning state

---

### 9. Real-Time Collaboration Update

**Trigger:** Remote user adds/checks item (WebSocket event)

**Animation:**

```
Duration: 400ms ease-in-out

New Item (Remote):
                  ┌─────────────┐
             [Glow]○ Yogurt     │ ← Fade in
                  │ Added by Jane│ ← Attribution
                  └─────────────┘
                        ↓
                  [Settle animation]

Check Item (Remote):
┌─────────────┐      ┌─────────────┐
│ ○ Milk      │ ───► │ ✓ Milk      │
│             │ [Glow]│ [highlight] │
└─────────────┘      └─────────────┘
```

**Effects:**

1. **New item:**
   - Fade in from top with blue glow (400ms)
   - Glow fades after 2 seconds
   - Attribution badge prominent
2. **Checked item:**
   - Brief yellow highlight (1 second)
   - Strikes through and moves to bottom
   - Toast: "Jane checked Milk" (optional, user preference)
3. **Presence update:**
   - Avatar fades in/out in presence bar (200ms)

**Accessibility:**

- Screen reader: "Jane added Yogurt to the list" (announced immediately)
- Live region: `aria-live="polite"` for non-disruptive updates
- Visual: Distinct animation for remote vs. local changes

---

### 10. Expiration Warning

**Trigger:** Item expiring within 3 days (daily check + open pantry)

**Animation:**

```
Duration: 300ms

Badge Pulse:
┌─────────────────────────┐
│ 🥛 Milk        ⚠️ 2 days│ ← Pulse
│ Whole, 1 gallon         │
│ Location: Fridge        │
└─────────────────────────┘
        ↓ [Pulse cycle]
   Scale: 1.0 → 1.1 → 1.0
   (Repeat 3 times, then stop)
```

**Effects:**

1. **Badge:** Warning icon pulses on screen load (3 pulses)
2. **Color:** Orange for 3-7 days, Red for <3 days
3. **Sort:** Expiring items move to top
4. **Banner:** Dismissible banner at top: "3 items expiring soon"

**Accessibility:**

- Screen reader: "Warning: Milk expires in 2 days"
- ARIA: `role="alert"` for critical (< 3 days)
- Visual: High contrast warning colors

---

## Gesture Support (Mobile)

### Swipe Gestures

| Gesture     | Context      | Action           | Threshold |
| ----------- | ------------ | ---------------- | --------- |
| Swipe left  | List item    | Reveal delete    | 40%       |
| Swipe right | List item    | Mark as complete | 40%       |
| Pull down   | List top     | Refresh          | 80px      |
| Long-press  | Item         | Context menu     | 500ms     |
| Long-press  | Drag handle  | Enter drag mode  | 500ms     |
| Pinch zoom  | Recipe image | Zoom image       | N/A       |

### Haptic Feedback

| Action                  | Haptic Type   | Duration |
| ----------------------- | ------------- | -------- |
| Item checked            | Light impact  | 10ms     |
| Item deleted            | Medium impact | 15ms     |
| Over budget             | Heavy impact  | 25ms     |
| Drag item lift          | Selection     | 10ms     |
| Drag item drop          | Light impact  | 10ms     |
| Pull to refresh trigger | Light impact  | 10ms     |
| Button press            | Light impact  | 10ms     |
| Error                   | Notification  | 50ms     |

---

## Keyboard Navigation

### Global Shortcuts

| Key            | Action                  | Context           |
| -------------- | ----------------------- | ----------------- |
| `/`            | Focus search            | Any page          |
| `N`            | New list/item           | Lists/List detail |
| `Ctrl/Cmd + R` | Refresh                 | Any page          |
| `Escape`       | Close modal/dialog      | Modal open        |
| `Ctrl/Cmd + S` | Save                    | Forms             |
| `?`            | Show keyboard shortcuts | Any page          |

### List Navigation

| Key           | Action                       |
| ------------- | ---------------------------- |
| `Tab`         | Next interactive element     |
| `Shift + Tab` | Previous interactive element |
| `Arrow Down`  | Next item                    |
| `Arrow Up`    | Previous item                |
| `Space`       | Check/uncheck item           |
| `Enter`       | Open item details            |
| `Delete`      | Delete focused item          |
| `E`           | Edit focused item            |

### Drag Mode (Reorder Items)

| Key          | Action               |
| ------------ | -------------------- |
| `Space`      | Enter/exit drag mode |
| `Arrow Down` | Move item down       |
| `Arrow Up`   | Move item up         |
| `Escape`     | Cancel drag          |

---

## Accessibility Standards

### Screen Reader Support

#### Semantic HTML

- Use native HTML5 elements: `<button>`, `<input>`, `<nav>`, `<main>`, `<article>`
- Proper heading hierarchy: `<h1>` → `<h2>` → `<h3>`
- Lists: `<ul>`, `<ol>`, `<li>` for navigation and item lists
- Forms: `<form>`, `<label>`, `<fieldset>`, `<legend>`

#### ARIA Labels

**Lists:**

```html
<div role="list" aria-label="Shopping list items">
  <div role="listitem" aria-label="Milk, $4.50, added by Jane">
    <!-- Item content -->
  </div>
</div>
```

**Buttons:**

```html
<button aria-label="Add item to list">
  <PlusIcon aria-hidden="true" />
</button>
```

**Form Fields:**

```html
<label for="item-name">Item Name</label>
<input
  id="item-name"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="item-name-error"
/>
<span id="item-name-error" role="alert"></span>
```

**Live Regions:**

```html
<div aria-live="polite" aria-atomic="true">
  <!-- Real-time updates -->
</div>

<div aria-live="assertive" role="alert">
  <!-- Critical errors -->
</div>
```

#### Announcements

| Event                | Announcement                              |
| -------------------- | ----------------------------------------- |
| Item added           | "Milk added to Dairy category"            |
| Item checked         | "Milk checked. Added to completed items." |
| Item deleted         | "Milk deleted. Undo available."           |
| List shared          | "List shared with Jane. Invitation sent." |
| Collaboration update | "Jane added Yogurt to the list"           |
| Budget exceeded      | "Warning: Budget exceeded by $2.49"       |
| Expiration warning   | "Warning: Milk expires in 2 days"         |
| Search results       | "5 results found for 'dairy'"             |
| Navigation           | "Navigated to Pantry screen"              |

### Focus Management

#### Focus Indicators

- **Style:** 2px solid ring in primary color with 2px offset
- **Contrast:** Minimum 3:1 against background
- **Visible:** Always visible, never hidden
- **Motion:** Smooth transition (100ms) when focus moves

#### Focus Order

- **Logical:** Follows visual layout (left-to-right, top-to-bottom)
- **Skip Links:** "Skip to main content" at page top
- **Modals:** Focus trap within modal, return to trigger on close
- **Forms:** Sequential field navigation with Tab

#### Focus States

```css
/* Default focus */
.focus-visible:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  transition: outline 100ms ease-out;
}

/* Interactive elements */
button:focus-visible {
  ring: 2px solid hsl(var(--ring));
  ring-offset: 2px;
}

/* Form inputs */
input:focus-visible {
  border-color: hsl(var(--ring));
  ring: 1px solid hsl(var(--ring));
}
```

### Visual Accessibility

#### Color Contrast

**WCAG AA Requirements:**

- Normal text: Minimum 4.5:1
- Large text (18pt+): Minimum 3:1
- UI components: Minimum 3:1

**Our Colors:**
| Element | Foreground | Background | Ratio | Pass |
| ---------------------- | ---------- | ---------- | ----- | ---- |
| Body text | #0a0a0a | #ffffff | 16.1 | ✅ |
| Button primary | #ffffff | #0a0a0a | 16.1 | ✅ |
| Button secondary | #0a0a0a | #f5f5f5 | 14.8 | ✅ |
| Muted text | #737373 | #ffffff | 4.6 | ✅ |
| Error text | #dc2626 | #ffffff | 5.9 | ✅ |
| Success text | #16a34a | #ffffff | 3.9 | ⚠️* |
| Warning text | #ea580c | #ffffff | 4.2 | ⚠️* |

\*Use bold for large text or combine with icons

#### Non-Color Indicators

- **Status:** Don't rely solely on color
  - Checked items: ✓ checkmark + strikethrough
  - Errors: ⚠️ icon + red color
  - Success: ✓ icon + green color
  - Budget over: 🚨 icon + red color + "Over budget" text

#### Touch Targets

**Minimum Size:** 44x44px (iOS), 48x48px (Android)  
**Our Implementation:** 48x48px minimum for all interactive elements

| Element            | Size              | Spacing        |
| ------------------ | ----------------- | -------------- |
| Button             | 48x48             | 8px            |
| Checkbox           | 48x48             | 8px            |
| Icon button        | 48x48             | 4px            |
| List item (mobile) | Full width × 64px | 4px            |
| FAB                | 56x56             | 16px from edge |

### Motion & Animation

#### Reduced Motion

**Respect user preference:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Alternatives:**

- Fade animations → Instant state change
- Slide animations → Instant position change
- Spin animations → Static icon
- Pulse effects → Solid state

#### Essential Motion

Keep minimal motion for:

- Loading spinners (alternative: progress bar)
- Live updates (alternative: badge notification)
- Form validation (alternative: instant error display)

---

## Loading & Error States

### Loading States

#### Skeleton Screens

- **Use when:** Initial page load, <2 seconds expected
- **Animation:** Subtle shimmer (1.5s loop)
- **Respect:** Reduced motion preference (static skeleton)

#### Spinners

- **Use when:** Action in progress, >2 seconds expected
- **Size:** 16px (inline), 32px (page), 48px (full-screen)
- **Color:** Muted foreground
- **Accessibility:** `aria-label="Loading"`, `role="status"`

#### Progress Bars

- **Use when:** File upload, data sync, known duration
- **Determinate:** Show percentage and time remaining
- **Indeterminate:** Pulse animation
- **Accessibility:** `role="progressbar"`, `aria-valuenow`, `aria-valuetext`

### Error States

#### Inline Errors (Form Fields)

```html
<div>
  <label for="email">Email</label>
  <input id="email" aria-invalid="true" aria-describedby="email-error" />
  <span id="email-error" role="alert">
    Please enter a valid email address
  </span>
</div>
```

#### Banner Errors (Page-level)

- **Position:** Top of content area
- **Color:** Red background with white text (5:1 contrast)
- **Icon:** ⚠️ or 🚨
- **Dismissible:** Close button (×)
- **Accessibility:** `role="alert"`, auto-announced

#### Toast Notifications

- **Duration:** 3-5 seconds (error), 2-3 seconds (success)
- **Position:** Bottom center (mobile), top right (desktop)
- **Persistent:** Errors remain until dismissed
- **Accessibility:** `role="status"` (success), `role="alert"` (error)

---

## Responsive Interactions

### Mobile (<640px)

- **Touch targets:** 48x48px minimum
- **Gestures:** Swipe, long-press, pull-to-refresh
- **Haptic feedback:** On all interactions
- **Modals:** Full-screen, slide up from bottom
- **Navigation:** Bottom tab bar

### Tablet (640px-1024px)

- **Touch targets:** 48x48px maintained
- **Gestures:** Swipe + keyboard support
- **Modals:** Center modal, max 600px width
- **Navigation:** Sidebar + bottom bar (landscape)

### Desktop (≥1024px)

- **Mouse interactions:** Hover states, tooltips
- **Keyboard:** Full keyboard navigation
- **Modals:** Center modal, max 800px width
- **Navigation:** Persistent sidebar
- **Drag-and-drop:** Mouse-based reordering

---

## Summary

**Interactions Specified:** 10 core interactions + 6 gesture types  
**Accessibility Standards:** WCAG 2.1 Level AA compliant  
**Keyboard Shortcuts:** 20+ shortcuts documented  
**Focus Management:** Complete focus strategy  
**Color Contrast:** All elements meet or exceed 4.5:1  
**Touch Targets:** All 48x48px minimum  
**Motion:** Reduced motion alternatives for all animations  
**Screen Reader:** Full ARIA labels and live regions

**Key Principles:**

- ✅ Every interaction has haptic feedback (mobile)
- ✅ Every animation respects `prefers-reduced-motion`
- ✅ Every interactive element has keyboard equivalent
- ✅ Every state change is announced to screen readers
- ✅ Every color indicator has non-color alternative
- ✅ Every touch target meets 48x48px minimum

**Testing Checklist:**

- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Test with NVDA/JAWS (Desktop)
- [ ] Test keyboard-only navigation
- [ ] Test with reduced motion enabled
- [ ] Test color contrast with tools
- [ ] Test touch target sizes on device
- [ ] Test haptic feedback on physical device

---

## Implementation Notes

**Animation Library:** Framer Motion or CSS animations  
**Haptic API:** `navigator.vibrate()` (with feature detection)  
**Focus Management:** `focus-visible` polyfill or native `:focus-visible`  
**ARIA:** `@radix-ui/react-*` components (built-in accessibility)  
**Testing:** `@testing-library/react` + `jest-axe` for a11y tests

**References:**

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- iOS HIG: https://developer.apple.com/design/human-interface-guidelines/
- Material Design: https://material.io/design/interaction/gestures.html
