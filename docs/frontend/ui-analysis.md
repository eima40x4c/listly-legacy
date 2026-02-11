# UI Analysis: User Stories to UI Requirements

**Status:** ✅ Complete
**Last Updated:** February 11, 2026
**SOP:** 302 - UI/UX Design

---

## Overview

This document maps user stories from [requirements.md](../requirements.md) to UI requirements, identifying components, interactions, and screens needed to fulfill each feature.

---

## Epic 1: Shopping List Management

### US-001: Create Multiple Shopping Lists

**User Story:** As a shopper, I want to create multiple shopping lists, so that I can organize items by store or occasion.

#### UI Implications

- **Lists Overview Screen** — Display all lists with create button
- **Create List Modal/Form** — Name input, optional icon/color picker
- **List Card Component** — Show name, item count, preview

#### Components Needed

| Component          | Type    | Description                          |
| ------------------ | ------- | ------------------------------------ |
| `ListsScreen`      | Page    | Main lists overview                  |
| `CreateListButton` | UI      | Floating action button (FAB)         |
| `ListForm`         | Feature | Create/edit list form                |
| `ListCard`         | Feature | List preview card with metadata      |
| `EmptyState`       | UI      | "No lists yet" placeholder           |
| `IconPicker`       | UI      | Icon selection dialog                |
| `ColorPicker`      | UI      | Color palette for list customization |

#### Interactions

1. **Tap FAB** → Open create list form
2. **Enter name** → Enable submit button
3. **Submit** → Create list, show success toast, navigate to list detail
4. **Tap list card** → Navigate to list detail

---

### US-002: Add Items (Text + Voice)

**User Story:** As a shopper, I want to add items to my list by typing or voice, so that I can quickly capture what I need.

#### UI Implications

- **Item Input Field** — Sticky at top of list, auto-focus
- **Voice Button** — Microphone icon to trigger voice input
- **Autocomplete Dropdown** — Suggestions from history below input
- **Quick Add Button** — Submit on enter/tap

#### Components Needed

| Component              | Type    | Description                   |
| ---------------------- | ------- | ----------------------------- |
| `ItemInput`            | Feature | Smart input with autocomplete |
| `VoiceButton`          | UI      | Microphone trigger            |
| `AutocompleteDropdown` | UI      | Suggestion list               |
| `RecentItemsList`      | Feature | History-based suggestions     |
| `AddItemButton`        | UI      | Submit button                 |

#### Interactions

1. **Focus input** → Show autocomplete with recent items
2. **Type** → Filter suggestions in real-time
3. **Select suggestion** → Fill input, add to list
4. **Tap mic** → Open voice recognition, transcribe to input
5. **Enter/tap add** → Add item, clear input, show brief success

---

### US-003: Auto-Categorization

**User Story:** As a shopper, I want items automatically categorized by aisle, so that I can shop efficiently without backtracking.

#### UI Implications

- **Grouped List View** — Items organized by category/aisle
- **Category Headers** — Collapsible sections with counts
- **Shopping Mode Toggle** — Switch between edit/shop view
- **Sort Order Settings** — Custom aisle ordering per store

#### Components Needed

| Component              | Type    | Description                          |
| ---------------------- | ------- | ------------------------------------ |
| `CategorySection`      | Feature | Collapsible category with items      |
| `CategoryHeader`       | UI      | Section header with count and toggle |
| `ShoppingModeToggle`   | UI      | View mode switcher                   |
| `ItemsByCategory`      | Feature | Grouped item list                    |
| `CategorySortSettings` | Feature | Custom aisle order configuration     |

#### Interactions

1. **View list** → Items auto-grouped by category
2. **Tap category header** → Collapse/expand section
3. **Toggle shopping mode** → Reorder by store aisle sequence
4. **Long-press category** → Reorder categories

---

### US-004: Check Off Items

**User Story:** As a shopper, I want to check off items as I shop, so that I can track my progress.

#### UI Implications

- **Checkbox/Touch Target** — Large, easy to tap
- **Checked State** — Strike-through text, move to bottom
- **Progress Indicator** — Show "X of Y items" at top
- **Undo Option** — Quick revert if mistapped
- **Finish Shopping Button** — Complete session

#### Components Needed

| Component              | Type    | Description                   |
| ---------------------- | ------- | ----------------------------- |
| `ItemCheckbox`         | UI      | Large touch-friendly checkbox |
| `CheckedItem`          | Feature | Struck-through item with undo |
| `ProgressBar`          | UI      | Visual progress indicator     |
| `FinishShoppingButton` | UI      | Complete shopping action      |
| `UndoToast`            | UI      | Toast with undo action        |

#### Interactions

1. **Tap item/checkbox** → Check off, animate to bottom, show undo toast
2. **Tap undo** → Revert checked state within 3 seconds
3. **All checked** → Show "Finish Shopping" button
4. **Tap finish** → Confirm modal, archive/clear list

---

### US-005: Customize Aisle Categories

**User Story:** As a shopper, I want to customize aisle categories for my favorite store, so that the sorting matches my actual store layout.

#### UI Implications

- **Store Settings Screen** — Configure aisle order per store
- **Drag-and-Drop List** — Reorder categories
- **Category Editor** — Rename categories, reassign items
- **Store Selector** — Switch between store layouts

#### Components Needed

| Component             | Type    | Description                     |
| --------------------- | ------- | ------------------------------- |
| `StoreSettingsScreen` | Page    | Store configuration screen      |
| `CategoryReorderList` | Feature | Drag-to-reorder category list   |
| `CategoryEditor`      | Feature | Edit category details           |
| `StoreSelector`       | UI      | Dropdown to select active store |
| `DragHandle`          | UI      | Drag indicator icon             |

#### Interactions

1. **Open store settings** → View current category order
2. **Drag category** → Reorder, save automatically
3. **Tap category** → Edit name, reassign items
4. **Switch store** → Load different layout

---

## Epic 2: Real-Time Collaboration

### US-006: Share Lists

**User Story:** As a household member, I want to share lists with family members, so that we can coordinate shopping.

#### UI Implications

- **Share Button** — In list options menu
- **Share Modal** — Email/link input, role selector
- **Collaborator List** — Show current members with roles
- **Invitation Status** — Pending/accepted indicators

#### Components Needed

| Component          | Type    | Description                       |
| ------------------ | ------- | --------------------------------- |
| `ShareButton`      | UI      | Share action trigger              |
| `ShareModal`       | Feature | Invite collaborators form         |
| `CollaboratorList` | Feature | List of members with roles        |
| `RoleSelector`     | UI      | Owner/editor/viewer picker        |
| `InvitationBadge`  | UI      | Pending/accepted status indicator |

#### Interactions

1. **Tap share** → Open share modal
2. **Enter email** → Send invitation
3. **Select role** → Set permissions (owner/editor/viewer)
4. **View collaborators** → See list members with remove option

---

### US-007: Real-Time Updates

**User Story:** As a collaborator, I want to see real-time updates when others add or check items, so that we don't duplicate efforts.

#### UI Implications

- **Live Indicator** — Show active collaborators
- **Optimistic Updates** — Instant UI updates
- **Animation** — Subtle fade-in for new items
- **Presence Avatars** — Show who's currently viewing

#### Components Needed

| Component            | Type    | Description                  |
| -------------------- | ------- | ---------------------------- |
| `PresenceIndicator`  | UI      | Active collaborators avatars |
| `LiveBadge`          | UI      | "Live" indicator             |
| `OptimisticListItem` | Feature | Item with pending state      |
| `AnimatedListItem`   | UI      | Fade-in animation wrapper    |

#### Interactions

1. **Item added remotely** → Fade in with animation
2. **Item checked remotely** → Strike-through with brief highlight
3. **User joins** → Avatar appears in presence bar
4. **Conflict** → Show merge dialog (rare)

---

### US-008: Activity Attribution

**User Story:** As a shopper, I want to see who added or checked items, so that I know what my household members contributed.

#### UI Implications

- **User Avatar** — Small avatar next to items
- **Timestamp** — Relative time ("2m ago", "Yesterday")
- **Activity Detail** — Expand to see full history
- **Filter by User** — Show only items from specific person

#### Components Needed

| Component         | Type    | Description                 |
| ----------------- | ------- | --------------------------- |
| `ItemAttribution` | UI      | Avatar + timestamp          |
| `ActivityLog`     | Feature | Expandable activity history |
| `UserFilter`      | UI      | Filter items by contributor |
| `ItemHistory`     | Feature | Full edit history modal     |

#### Interactions

1. **Tap item details** → Show who added, when
2. **Long-press item** → View full edit history
3. **Tap user filter** → Show only their contributions

---

## Epic 3: Budget & Price Tracking

### US-009: Set Budget

**User Story:** As a budget-conscious shopper, I want to set a budget for my shopping trip, so that I can track spending as I shop.

#### UI Implications

- **Budget Input** — Set budget when creating list
- **Progress Bar** — Visual spending tracker
- **Warning Indicator** — Red when over budget
- **Estimated vs Actual** — Compare planned vs spent

#### Components Needed

| Component           | Type    | Description                   |
| ------------------- | ------- | ----------------------------- |
| `BudgetInput`       | UI      | Currency input field          |
| `BudgetProgressBar` | Feature | Spending progress with colors |
| `BudgetWarning`     | UI      | Over-budget alert banner      |
| `BudgetSummary`     | Feature | Estimated vs actual breakdown |

#### Interactions

1. **Set budget** → Show progress bar on list
2. **Add priced items** → Update progress in real-time
3. **Exceed budget** → Show warning banner
4. **Finish shopping** → Compare estimated vs actual

---

### US-010: Record Prices

**User Story:** As a shopper, I want to record prices when I shop, so that I can build a price history.

#### UI Implications

- **Price Input Modal** — Prompt after checking item
- **Price Display** — Show last price on items
- **Price Badge** — Visual indicator of price availability
- **Skip Option** — Dismiss price prompt

#### Components Needed

| Component         | Type    | Description                   |
| ----------------- | ------- | ----------------------------- |
| `PriceInputModal` | Feature | Quick price entry after check |
| `PriceDisplay`    | UI      | Show price on item card       |
| `PriceBadge`      | UI      | "$X.XX" indicator             |
| `PriceTrendIcon`  | UI      | ↑/↓ arrow for price changes   |

#### Interactions

1. **Check item** → Optional price prompt
2. **Enter price** → Save, update history
3. **Skip** → Dismiss, don't prompt again this session
4. **View price** → See last price and trend

---

### US-011: Price Comparisons

**User Story:** As a price-aware shopper, I want to see price comparisons across stores, so that I can shop where items are cheapest.

#### UI Implications

- **Store Price Table** — Compare prices by store
- **Best Price Indicator** — Highlight cheapest option
- **Savings Calculator** — Show potential savings
- **Store Switcher** — Change list's target store

#### Components Needed

| Component              | Type    | Description                  |
| ---------------------- | ------- | ---------------------------- |
| `PriceComparisonTable` | Feature | Multi-store price grid       |
| `BestPriceBadge`       | UI      | "Best price" indicator       |
| `SavingsCalculator`    | Feature | Show total savings potential |
| `StoreComparison`      | Page    | Full price comparison view   |

#### Interactions

1. **Tap price** → View all store prices
2. **See best price** → Highlight with badge
3. **Calculate savings** → Show if shop at cheapest store
4. **Switch store** → Update list target store

---

### US-012: Spending History

**User Story:** As a shopper, I want to see my spending history and trends, so that I can understand my shopping habits.

#### UI Implications

- **History Timeline** — Scrollable list of trips
- **Category Breakdown** — Pie/bar chart
- **Date Range Filter** — Week/month/year selector
- **Trend Graph** — Line chart of spending over time

#### Components Needed

| Component               | Type    | Description                        |
| ----------------------- | ------- | ---------------------------------- |
| `SpendingHistoryScreen` | Page    | Main history view                  |
| `TripCard`              | Feature | Past shopping trip summary         |
| `CategoryChart`         | UI      | Spending by category visualization |
| `TrendGraph`            | UI      | Line chart of spending             |
| `DateRangeFilter`       | UI      | Time period selector               |

#### Interactions

1. **View history** → See timeline of trips
2. **Tap trip** → View detailed receipt
3. **Change date range** → Update charts
4. **View by category** → See spending breakdown

---

## Epic 4: AI-Powered Suggestions

### US-013: Pattern-Based Suggestions

**User Story:** As a returning shopper, I want AI to suggest items I might need, so that I don't forget regular purchases.

#### UI Implications

- **Suggestion Banner** — "You usually buy milk. Add it?"
- **Suggested Items Section** — Predictive item list
- **Snooze/Dismiss** — Ignore suggestion temporarily
- **Confidence Indicator** — Show AI confidence level

#### Components Needed

| Component            | Type    | Description                        |
| -------------------- | ------- | ---------------------------------- |
| `SuggestionBanner`   | Feature | Smart suggestion notification      |
| `SuggestedItemsList` | Feature | AI-recommended items               |
| `SuggestionCard`     | UI      | Individual suggestion with actions |
| `ConfidenceBadge`    | UI      | AI confidence indicator            |

#### Interactions

1. **View suggestions** → See AI-recommended items
2. **Tap add** → Add to list, dismiss suggestion
3. **Tap dismiss** → Hide temporarily
4. **Snooze** → Remind me later

---

### US-014: Complementary Suggestions

**User Story:** As a shopper, I want smart suggestions based on my current list, so that I get complementary items.

#### UI Implications

- **"Don't Forget" Section** — Contextual suggestions
- **Item Pairing Cards** — Related item recommendations
- **Inline Suggestions** — Under added items
- **Recipe Suggestions** — Meal ideas from current items

#### Components Needed

| Component            | Type    | Description              |
| -------------------- | ------- | ------------------------ |
| `ComplementaryItems` | Feature | Related item suggestions |
| `PairingSuggestion`  | UI      | "Often bought with" card |
| `RecipeSuggestion`   | Feature | Meal idea based on items |
| `InlineSuggestion`   | UI      | Suggestion below item    |

#### Interactions

1. **Add pasta** → Suggest marinara, parmesan
2. **View suggestions** → See related items
3. **Tap suggestion** → Add all or individual items
4. **View recipe** → See suggested meal

---

### US-015: Deal Alerts

**User Story:** As a deal-conscious shopper, I want AI to alert me to good prices based on my history, so that I can stock up.

#### UI Implications

- **Deal Badge** — "Great price!" indicator on items
- **Deal Notification** — Push notification for deals
- **Deal Settings** — Configure alert thresholds
- **Price Drop List** — View all current deals

#### Components Needed

| Component           | Type    | Description                 |
| ------------------- | ------- | --------------------------- |
| `DealBadge`         | UI      | "Deal!" indicator           |
| `DealNotification`  | Feature | Push notification component |
| `DealAlertSettings` | Feature | Configure alert preferences |
| `DealsScreen`       | Page    | All current deals           |

#### Interactions

1. **See deal** → Badge on item with savings
2. **Tap deal** → View price history
3. **Configure alerts** → Set discount thresholds
4. **View all deals** → See opportunities

---

## Epic 5: Pantry Inventory & Expiration Tracking

### US-016: Pantry Inventory

**User Story:** As a household manager, I want to track what's in my pantry, so that I don't buy duplicates.

#### UI Implications

- **Pantry Screen** — Separate inventory view
- **Add to Pantry Prompt** — After checking item
- **Duplicate Warning** — When adding item already in pantry
- **Stock Level Indicator** — Show quantity available

#### Components Needed

| Component           | Type    | Description                 |
| ------------------- | ------- | --------------------------- |
| `PantryScreen`      | Page    | Pantry inventory view       |
| `AddToPantryPrompt` | Feature | Quick add after shopping    |
| `DuplicateWarning`  | UI      | Alert banner for duplicates |
| `StockIndicator`    | UI      | Quantity badge              |
| `PantryItemCard`    | Feature | Inventory item with details |

#### Interactions

1. **Check item** → Prompt "Add to pantry?"
2. **Add to pantry** → Move to inventory
3. **Add list item** → Warn if in pantry
4. **View pantry** → See all inventory

---

### US-017: Expiration Tracking

**User Story:** As a waste-conscious user, I want to track expiration dates, so that I use items before they spoil.

#### UI Implications

- **Expiration Date Input** — Date picker when adding to pantry
- **Expiration Badge** — Days until expiry indicator
- **"Use Soon" Alert** — Warning for items expiring within 3 days
- **Expired Filter** — View expired items

#### Components Needed

| Component              | Type    | Description                 |
| ---------------------- | ------- | --------------------------- |
| `ExpirationDatePicker` | UI      | Date input with calendar    |
| `ExpirationBadge`      | UI      | Days remaining indicator    |
| `UseSoonAlert`         | Feature | Expiring items notification |
| `ExpiredFilter`        | UI      | Filter expired items        |

#### Interactions

1. **Add to pantry** → Set expiration date
2. **3 days before** → Show "Use soon" alert
3. **View expiring** → See items by expiry date
4. **Filter expired** → See past-due items

---

### US-018: Barcode Scanning

**User Story:** As a user, I want to scan barcodes to add items to my pantry, so that entry is fast and accurate.

#### UI Implications

- **Camera Scanner** — Full-screen barcode camera view
- **Scan Overlay** — Targeting reticle/frame
- **Product Info** — Show identified product
- **Manual Entry Fallback** — If barcode not found

#### Components Needed

| Component            | Type    | Description                   |
| -------------------- | ------- | ----------------------------- |
| `BarcodeScannerView` | Feature | Camera-based scanner          |
| `ScanOverlay`        | UI      | Targeting UI over camera      |
| `ProductCard`        | Feature | Identified product display    |
| `ManualEntryForm`    | Feature | Fallback for unknown barcodes |

#### Interactions

1. **Tap scan** → Open camera view
2. **Align barcode** → Auto-detect and scan
3. **Product found** → Show details, add button
4. **Not found** → Manual entry form

---

### US-019: Pantry Organization

**User Story:** As a user, I want to see my pantry inventory organized by category and location, so that I can find items easily.

#### UI Implications

- **Category Groups** — Collapsible sections (dry goods, canned, etc.)
- **Location Filter** — Fridge, freezer, cabinet tabs
- **Search Bar** — Quick find
- **Sort Options** — By expiry, name, category

#### Components Needed

| Component            | Type    | Description                |
| -------------------- | ------- | -------------------------- |
| `PantryCategoryView` | Feature | Grouped inventory view     |
| `LocationTabs`       | UI      | Filter by storage location |
| `PantrySearchBar`    | UI      | Search inventory           |
| `PantrySortOptions`  | UI      | Sort dropdown              |

#### Interactions

1. **View pantry** → See items by category
2. **Tap location** → Filter by storage
3. **Search** → Find specific item
4. **Sort** → Reorder by criteria

---

## Epic 6: Meal Planning & Recipe Integration

### US-020: Meal Planning

**User Story:** As a meal planner, I want to plan meals for the week, so that I can generate a shopping list from my meal plan.

#### UI Implications

- **Meal Calendar** — Week view with meals
- **Recipe Selector** — Browse/search recipes
- **Drag-and-Drop** — Assign recipes to days
- **Generate List Button** — Create shopping list from plan

#### Components Needed

| Component            | Type    | Description            |
| -------------------- | ------- | ---------------------- |
| `MealCalendarScreen` | Page    | Week planning view     |
| `MealSlot`           | UI      | Day/meal placeholder   |
| `RecipeBrowser`      | Feature | Recipe selection modal |
| `GenerateListButton` | UI      | Create list from plan  |

#### Interactions

1. **View calendar** → See week with empty slots
2. **Tap slot** → Select recipe
3. **Assign recipe** → Fill slot with meal
4. **Generate list** → Extract all ingredients

---

### US-021: Recipe Management

**User Story:** As a home cook, I want to save and organize recipes, so that I can meal plan from my favorites.

#### UI Implications

- **Recipe Collection** — Grid/list of saved recipes
- **Recipe Card** — Image, title, time, servings
- **Recipe Details** — Full view with ingredients/instructions
- **Filter/Search** — Find recipes by criteria

#### Components Needed

| Component                | Type    | Description                   |
| ------------------------ | ------- | ----------------------------- |
| `RecipeCollectionScreen` | Page    | All saved recipes             |
| `RecipeCard`             | Feature | Recipe preview card           |
| `RecipeDetailScreen`     | Page    | Full recipe view              |
| `RecipeFilterBar`        | UI      | Filter by cuisine, time, etc. |

#### Interactions

1. **Browse recipes** → View collection
2. **Tap recipe** → See details
3. **Save recipe** → Add to collection
4. **Filter** → Show matching recipes

---

### US-022: Pantry-Aware List Generation

**User Story:** As a meal planner, I want the generated list to account for pantry inventory, so that I only buy what I actually need.

#### UI Implications

- **Inventory Check** — Compare recipe needs to pantry
- **Smart Quantities** — Calculate needed amounts
- **"Already Have" Indicator** — Show items in stock
- **Partial Needs** — "Need 2 more" for partial matches

#### Components Needed

| Component           | Type    | Description                 |
| ------------------- | ------- | --------------------------- |
| `InventoryChecker`  | Feature | Compare recipe to pantry    |
| `SmartQuantityCalc` | Feature | Calculate needed amounts    |
| `InStockBadge`      | UI      | "Already have" indicator    |
| `PartialNeedItem`   | Feature | Show partial quantity needs |

#### Interactions

1. **Generate list** → Check pantry inventory
2. **Have full amount** → Skip or show "in stock"
3. **Have partial** → Add remaining needed
4. **Don't have** → Add full amount

---

### US-023: Recipe Import

**User Story:** As a user, I want to import recipes from URLs, so that I can use recipes from my favorite websites.

#### UI Implications

- **URL Input** — Paste recipe link
- **Import Progress** — Loading state during extraction
- **Preview** — Show extracted recipe before saving
- **Manual Edit** — Fix any extraction errors

#### Components Needed

| Component           | Type    | Description              |
| ------------------- | ------- | ------------------------ |
| `RecipeImportModal` | Feature | URL input and import     |
| `ImportProgress`    | UI      | Loading indicator        |
| `RecipePreview`     | Feature | Show extracted recipe    |
| `RecipeEditor`      | Feature | Manual recipe entry/edit |

#### Interactions

1. **Paste URL** → Import recipe
2. **Show loading** → Extract data
3. **Preview** → Review before saving
4. **Edit** → Fix any issues
5. **Save** → Add to collection

---

## Epic 7: Offline-First & Background Sync

### US-024: Offline Operation

**User Story:** As a shopper in a store with poor signal, I want the app to work offline, so that I can still use my list.

#### UI Implications

- **Offline Indicator** — Show connection status
- **Optimistic UI** — Updates appear instant
- **Sync Badge** — Show pending sync count
- **Offline Notice** — Subtle banner when offline

#### Components Needed

| Component          | Type | Description              |
| ------------------ | ---- | ------------------------ |
| `OfflineIndicator` | UI   | Connection status badge  |
| `SyncBadge`        | UI   | Pending changes count    |
| `OfflineBanner`    | UI   | "You're offline" notice  |
| `SyncStatusIcon`   | UI   | Syncing/synced indicator |

#### Interactions

1. **Go offline** → Show offline indicator
2. **Make changes** → Queue for sync
3. **Return online** → Auto-sync in background
4. **Show sync status** → "Syncing..." → "Synced"

---

### US-025: Background Sync

**User Story:** As a collaborator, I want offline changes to sync automatically when online, so that data is never lost.

#### UI Implications

- **Auto-Sync** — Background sync without user action
- **Conflict Resolution** — Modal if conflicts detected
- **Sync History** — Show recent syncs (optional)
- **Manual Sync Button** — Force sync if needed

#### Components Needed

| Component               | Type    | Description             |
| ----------------------- | ------- | ----------------------- |
| `BackgroundSyncManager` | Feature | Auto-sync service       |
| `ConflictModal`         | Feature | Resolve merge conflicts |
| `SyncHistoryLog`        | Feature | Recent sync activity    |
| `ManualSyncButton`      | UI      | Force sync trigger      |

#### Interactions

1. **Online** → Auto-sync queued changes
2. **Conflict** → Show resolution options
3. **View history** → See sync activity
4. **Force sync** → Manual trigger

---

### US-026: PWA Installation

**User Story:** As a user, I want the app to be installable on my home screen, so that it feels like a native app.

#### UI Implications

- **Install Prompt** — Browser-triggered banner
- **Custom Install Banner** — In-app promotion
- **Installed State** — Hide install prompt after installed
- **Launch Experience** — Standalone mode (no browser UI)

#### Components Needed

| Component             | Type    | Description              |
| --------------------- | ------- | ------------------------ |
| `InstallPromptBanner` | Feature | Custom install promotion |
| `PWAInstaller`        | Feature | Handle install flow      |
| `SplashScreen`        | UI      | Loading screen on launch |

#### Interactions

1. **Visit site** → Show install prompt
2. **Tap install** → Add to home screen
3. **Launch app** → Open in standalone mode
4. **Already installed** → Hide install banner

---

## Epic 8: Location-Based Reminders

### US-027: Store Proximity Reminders

**User Story:** As a forgetful shopper, I want reminders when I'm near a store, so that I don't miss shopping opportunities.

#### UI Implications

- **Notification** — Push notification when near store
- **Location Permission** — Request location access
- **Store Radius Settings** — Configure distance threshold
- **Reminder Dismiss** — Snooze or mark as done

#### Components Needed

| Component            | Type    | Description                 |
| -------------------- | ------- | --------------------------- |
| `LocationPermission` | Feature | Request location access     |
| `GeoNotification`    | Feature | Proximity-triggered push    |
| `RadiusSettings`     | Feature | Configure reminder distance |
| `ReminderCard`       | UI      | In-app reminder display     |

#### Interactions

1. **Grant permission** → Enable location tracking
2. **Near store** → Send push notification
3. **Tap notification** → Open list
4. **Snooze** → Remind again later

---

### US-028: Privacy Controls

**User Story:** As a privacy-conscious user, I want control over location tracking, so that I can choose when the app tracks me.

#### UI Implications

- **Privacy Settings** — Location toggle
- **Permission Prompt** — Explain why location needed
- **Location Status** — Show if tracking active
- **Data Deletion** — Clear location history

#### Components Needed

| Component               | Type | Description             |
| ----------------------- | ---- | ----------------------- |
| `PrivacySettingsScreen` | Page | Privacy controls        |
| `LocationToggle`        | UI   | Enable/disable tracking |
| `PermissionExplainer`   | UI   | Why we need location    |
| `DataDeletionButton`    | UI   | Clear location data     |

#### Interactions

1. **View settings** → See location status
2. **Toggle off** → Disable tracking
3. **View explainer** → Understand usage
4. **Delete data** → Clear history

---

### US-029: Favorite Stores

**User Story:** As a user, I want to define my favorite store locations, so that reminders are relevant to me.

#### UI Implications

- **Store Search** — Find stores by name/address
- **Store Map** — Visual store selection
- **Favorite List** — Saved stores
- **Store Details** — Address, hours, distance

#### Components Needed

| Component            | Type    | Description              |
| -------------------- | ------- | ------------------------ |
| `StoreSearchScreen`  | Page    | Find stores              |
| `StoreMap`           | Feature | Map with store locations |
| `FavoriteStoresList` | Feature | Saved stores             |
| `StoreCard`          | Feature | Store info card          |

#### Interactions

1. **Search stores** → Find by name
2. **View map** → See nearby stores
3. **Add favorite** → Save store
4. **View favorites** → See saved stores

---

## Derived UI Requirements

### Global Requirements

#### Navigation

- **Bottom Tab Navigation (Mobile)** — Lists, Pantry, Recipes, Meal Plan, Settings
- **Sidebar Navigation (Desktop)** — Persistent sidebar with all sections
- **Back Button** — Consistent header back navigation
- **Home/Dashboard** — Central hub showing recent activity

#### Headers

- **Page Header** — Title, back button, actions
- **Sticky Headers** — Fixed position on scroll
- **Action Menu** — Overflow menu (⋮) for page actions

#### Modals & Dialogs

- **Bottom Sheet (Mobile)** — Actions slide up from bottom
- **Center Modal (Desktop)** — Traditional modal dialogs
- **Confirmation Dialogs** — Delete, discard changes, etc.
- **Full-Screen Modals** — Create/edit forms

#### Loading States

- **Skeleton Screens** — Content placeholders
- **Spinners** — Loading indicators
- **Progressive Loading** — Load critical content first

#### Error States

- **Error Banners** — Non-intrusive error messages
- **Inline Validation** — Form field errors
- **Empty States** — No data placeholders
- **Network Error** — Offline/connection issues

#### Feedback

- **Toast Notifications** — Success/error messages
- **Haptic Feedback** — Touch vibrations (mobile)
- **Visual Feedback** — Button press states, loading

### Accessibility Requirements

#### Screen Reader Support

- Semantic HTML elements
- ARIA labels for icons and actions
- Announcements for dynamic content
- Descriptive alt text for images

#### Keyboard Navigation

- Tab order follows logical flow
- Skip links for repeated navigation
- Keyboard shortcuts for common actions
- Focus indicators on all interactive elements

#### Visual Accessibility

- Minimum contrast ratio: 4.5:1
- Focus indicators: 2px solid outline
- Touch targets: minimum 44x44px
- Text scalability: Support up to 200%

#### Motion

- Respect `prefers-reduced-motion`
- Disable animations if preference set
- Provide alternative static states
- Keep essential motion minimal

### Responsive Behavior

#### Breakpoints

| Breakpoint | Width   | Layout                         |
| ---------- | ------- | ------------------------------ |
| Mobile     | <640px  | Single column, bottom nav      |
| Tablet     | 640px+  | Two columns, side nav          |
| Desktop    | 1024px+ | Multi-pane, hover interactions |

#### Mobile Optimizations

- Touch-friendly targets (44x44px minimum)
- Swipe gestures (swipe to delete, refresh)
- Bottom navigation for thumb-friendly access
- FAB for primary actions
- Pull-to-refresh

#### Desktop Enhancements

- Hover states for interactive elements
- Keyboard shortcuts
- Drag-and-drop for reordering
- Multi-select with shift+click
- Right-click context menus

---

## Summary

This UI analysis maps **29 user stories** across **8 epics** to comprehensive UI requirements, identifying:

- **80+ components** needed across UI, Layout, and Feature categories
- **200+ interactions** and user flows
- **5 key screens**: Lists, Pantry, Recipes, Meal Plan, Settings
- **8 modal types**: Create list, share, price input, conflict resolution, etc.

**Next Steps:**

1. ✅ Create user flows for key journeys → [ui-design/user-flows.md](ui-design/user-flows.md)
2. ✅ Design wireframes for main screens → [ui-design/wireframes.md](ui-design/wireframes.md)
3. ✅ Document component hierarchies → [ui-design/component-hierarchies.md](ui-design/component-hierarchies.md)
4. ✅ Specify interactions and animations → [ui-design/interactions.md](ui-design/interactions.md)
