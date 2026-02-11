# Component Hierarchies

**Status:** ✅ Complete  
**Last Updated:** February 11, 2026  
**SOP:** 302 - UI/UX Design

---

## Overview

This document maps wireframes to component trees, showing the hierarchical structure of React components for each screen in the Listly application.

**Component Categories:**

- **Page:** Top-level page components
- **Feature:** Business logic components (domain-specific)
- **Layout:** Structural components (headers, containers, navigation)
- **UI:** Generic, reusable UI components

---

## 1. Lists Overview Screen

```
ListsScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── MenuButton (UI)
│   │   ├── Logo (UI)
│   │   ├── UserAvatar (UI)
│   │   └── ThemeToggle (UI)
│   │
│   ├── SearchBar (UI)
│   │
│   ├── Container (Layout)
│   │   │
│   │   ├── SectionHeader (UI)
│   │   │   └── Text: "MY LISTS"
│   │   │
│   │   ├── ListGrid (Feature)
│   │   │   └── ListCard (Feature) [repeated]
│   │   │       ├── Card (UI)
│   │   │       ├── CardHeader (UI)
│   │   │       │   ├── Icon (UI)
│   │   │       │   ├── Title (UI)
│   │   │       │   └── MenuButton (UI)
│   │   │       ├── CardContent (UI)
│   │   │       │   ├── ItemCount (UI)
│   │   │       │   ├── BudgetDisplay (Feature) [conditional]
│   │   │       │   │   ├── BudgetProgress (UI)
│   │   │       │   │   └── BudgetText (UI)
│   │   │       │   ├── CollaboratorAvatars (Feature) [conditional]
│   │   │       │   │   └── Avatar (UI) [multiple]
│   │   │       │   └── Timestamp (UI)
│   │   │       └── CardFooter (UI) [optional]
│   │   │
│   │   ├── SectionHeader (UI)
│   │   │   └── Text: "TEMPLATES"
│   │   │
│   │   └── ListGrid (Feature)
│   │       └── ListCard (Feature) [repeated]
│   │           └── Badge (UI): "Template"
│   │
│   ├── EmptyState (UI) [conditional]
│   │   ├── Icon (UI)
│   │   ├── Heading (UI)
│   │   ├── Description (UI)
│   │   └── Button (UI): "Create Your First List"
│   │
│   ├── FloatingActionButton (UI)
│   │   └── Icon: "+"
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       ├── NavItem (UI): Lists [active]
│       ├── NavItem (UI): Pantry
│       ├── NavItem (UI): Meals
│       ├── NavItem (UI): Budget
│       └── NavItem (UI): Settings
│
└── CreateListModal (Feature) [conditional]
    └── [See Modal Hierarchy below]
```

---

## 2. List Detail Screen (Edit Mode)

```
ListDetailScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── BackButton (UI)
│   │   ├── Title (UI) [editable]
│   │   │   └── ListIcon (UI)
│   │   ├── ShareButton (UI)
│   │   └── MenuButton (UI)
│   │       └── DropdownMenu (UI)
│   │           ├── MenuItem: "Edit List"
│   │           ├── MenuItem: "Share"
│   │           ├── MenuItem: "Duplicate"
│   │           └── MenuItem: "Delete"
│   │
│   ├── StickyHeader (Layout) [sticky]
│   │   ├── ItemInput (Feature)
│   │   │   ├── Input (UI)
│   │   │   ├── AddButton (UI)
│   │   │   ├── VoiceButton (UI)
│   │   │   └── AutocompleteDropdown (Feature) [conditional]
│   │   │       └── SuggestionList (UI)
│   │   │           └── SuggestionItem (UI) [repeated]
│   │   │
│   │   ├── BudgetSummary (Feature) [conditional]
│   │   │   ├── BudgetProgress (UI)
│   │   │   └── BudgetText (UI)
│   │   │
│   │   └── ModeToggle (UI)
│   │       ├── Tab: "Edit Mode" [active]
│   │       └── Tab: "Shopping Mode"
│   │
│   ├── Container (Layout)
│   │   ├── PresenceBar (Feature) [conditional]
│   │   │   ├── LiveBadge (UI)
│   │   │   └── AvatarGroup (UI)
│   │   │       └── Avatar (UI) [repeated]
│   │   │
│   │   └── CategoryList (Feature)
│   │       └── CategorySection (Feature) [repeated]
│   │           ├── CategoryHeader (UI) [collapsible]
│   │           │   ├── Icon (UI)
│   │           │   ├── CategoryName (UI)
│   │           │   ├── ItemCount (UI)
│   │           │   └── CollapseToggle (UI)
│   │           │
│   │           └── ItemList (Feature) [collapsible]
│   │               └── ListItem (Feature) [repeated]
│   │                   ├── DragHandle (UI)
│   │                   ├── Checkbox (UI)
│   │                   ├── ItemContent (Feature)
│   │                   │   ├── ItemName (UI)
│   │                   │   ├── ItemDetails (UI)
│   │                   │   ├── ItemPrice (UI) [conditional]
│   │                   │   └── Attribution (Feature) [conditional]
│   │                   │       ├── UserAvatar (UI)
│   │                   │       └── Timestamp (UI)
│   │                   └── ItemActions (Feature)
│   │                       └── MenuButton (UI)
│   │                           └── DropdownMenu (UI)
│   │                               ├── MenuItem: "Edit"
│   │                               ├── MenuItem: "Set Price"
│   │                               ├── MenuItem: "Move Category"
│   │                               └── MenuItem: "Delete"
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       └── [Same as Lists Screen]
│
└── ShareModal (Feature) [conditional]
    └── [See Modal Hierarchy below]
```

---

## 3. List Detail Screen (Shopping Mode)

```
ListDetailScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── BackButton (UI)
│   │   ├── Title (UI)
│   │   └── MenuButton (UI)
│   │
│   ├── StickyHeader (Layout) [sticky]
│   │   ├── ProgressSummary (Feature)
│   │   │   ├── ProgressText (UI): "3 of 7 items"
│   │   │   └── ProgressBar (UI)
│   │   │
│   │   ├── BudgetSummary (Feature) [conditional]
│   │   │   ├── BudgetProgress (UI)
│   │   │   └── BudgetText (UI)
│   │   │
│   │   └── ModeToggle (UI)
│   │       ├── Tab: "Edit Mode"
│   │       └── Tab: "Shopping Mode" [active]
│   │
│   ├── Container (Layout)
│   │   └── CategoryList (Feature) [sorted by aisle]
│   │       └── CategorySection (Feature) [repeated]
│   │           ├── CategoryHeader (UI)
│   │           │   ├── Icon (UI)
│   │           │   ├── CategoryName (UI)
│   │           │   ├── AisleNumber (UI): "(Aisle 1)"
│   │           │   └── CollapseToggle (UI)
│   │           │
│   │           └── ItemList (Feature)
│   │               ├── ActiveItems (Feature)
│   │               │   └── ShoppingListItem (Feature) [repeated]
│   │               │       ├── Checkbox (UI) [large]
│   │               │       ├── ItemContent (Feature)
│   │               │       │   ├── ItemName (UI)
│   │               │       │   ├── ItemDetails (UI)
│   │               │       │   └── ItemPrice (UI)
│   │               │       └── UndoButton (UI) [conditional]
│   │               │
│   │               └── CheckedItems (Feature)
│   │                   └── CheckedItem (Feature) [repeated]
│   │                       ├── Checkbox (UI) [checked]
│   │                       ├── ItemContent (Feature) [strikethrough]
│   │                       │   ├── ItemName (UI)
│   │                       │   └── ItemPrice (UI)
│   │                       └── UndoButton (UI)
│   │
│   ├── FinishButton (UI) [conditional: all checked]
│   │   └── Button: "Finish Shopping"
│   │
│   └── UndoToast (UI) [conditional]
│       ├── Message (UI)
│       └── UndoAction (UI)
│
└── PriceInputModal (Feature) [conditional]
    └── [See Modal Hierarchy below]
```

---

## 4. Create/Edit List Modal

```
ListFormModal (Feature)
├── Modal (UI)
│   ├── ModalHeader (UI)
│   │   ├── CloseButton (UI)
│   │   └── Title (UI): "Create List" / "Edit List"
│   │
│   ├── ModalContent (UI)
│   │   ├── Form (UI)
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "List Name *"
│   │   │   │   ├── Input (UI)
│   │   │   │   └── ErrorMessage (UI) [conditional]
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Description (optional)"
│   │   │   │   ├── Textarea (UI)
│   │   │   │   └── FormDescription (UI)
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Icon"
│   │   │   │   └── IconPicker (Feature)
│   │   │   │       └── IconButton (UI) [repeated]
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Color"
│   │   │   │   └── ColorPicker (Feature)
│   │   │   │       └── ColorButton (UI) [repeated]
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Budget (optional)"
│   │   │   │   ├── Input (UI) [type: number, currency]
│   │   │   │   └── FormDescription (UI)
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Store (optional)"
│   │   │   │   └── Select (UI)
│   │   │   │       └── Option (UI) [repeated]
│   │   │   │
│   │   │   └── FormField (Feature)
│   │   │       ├── Checkbox (UI)
│   │   │       └── Label (UI): "Make this a template"
│   │   │
│   │   └── ModalFooter (UI)
│   │       ├── Button (UI): "Cancel" [variant: outline]
│   │       └── Button (UI): "Create List" / "Save Changes" [variant: primary]
│   │
│   └── LoadingOverlay (UI) [conditional]
│       └── Spinner (UI)
```

---

## 5. Share List Modal

```
ShareModal (Feature)
├── Modal (UI)
│   ├── ModalHeader (UI)
│   │   ├── CloseButton (UI)
│   │   └── Title (UI): "Share 'Groceries'"
│   │
│   ├── ModalContent (UI)
│   │   │
│   │   ├── InviteSection (Feature)
│   │   │   ├── Form (UI)
│   │   │   │   ├── FormField (Feature)
│   │   │   │   │   ├── Label (UI): "Invite by Email"
│   │   │   │   │   └── Input (UI) [type: email]
│   │   │   │   │
│   │   │   │   ├── FormField (Feature)
│   │   │   │   │   ├── Label (UI): "Role"
│   │   │   │   │   └── Select (UI)
│   │   │   │   │       ├── Option: "Owner"
│   │   │   │   │       ├── Option: "Editor" [default]
│   │   │   │   │       └── Option: "Viewer"
│   │   │   │   │
│   │   │   │   └── RoleExplainer (UI)
│   │   │   │       ├── RoleDescription: "Owner — Full control"
│   │   │   │       ├── RoleDescription: "Editor — Can add/edit/check items"
│   │   │   │       └── RoleDescription: "Viewer — View only"
│   │   │   │
│   │   │   └── Button (UI): "Send Invitation"
│   │   │
│   │   ├── Divider (UI)
│   │   │
│   │   ├── CollaboratorsSection (Feature)
│   │   │   ├── SectionHeader (UI): "CURRENT COLLABORATORS"
│   │   │   │
│   │   │   └── CollaboratorList (Feature)
│   │   │       └── CollaboratorCard (Feature) [repeated]
│   │   │           ├── Avatar (UI)
│   │   │           ├── UserInfo (Feature)
│   │   │           │   ├── UserName (UI)
│   │   │           │   ├── UserEmail (UI)
│   │   │           │   ├── RoleBadge (UI)
│   │   │           │   └── Status (UI) [Joined / Pending]
│   │   │           └── MenuButton (UI) [not for owner]
│   │   │               └── DropdownMenu (UI)
│   │   │                   ├── MenuItem: "Change Role"
│   │   │                   └── MenuItem: "Remove"
│   │   │
│   │   ├── Divider (UI)
│   │   │
│   │   └── ShareLinkSection (Feature)
│   │       ├── Label (UI): "Share Link"
│   │       └── CopyInput (Feature)
│   │           ├── Input (UI) [readonly]
│   │           └── CopyButton (UI)
│   │
│   └── ModalFooter (UI)
│       └── Button (UI): "Done"
```

---

## 6. Pantry Screen

```
PantryScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── MenuButton (UI)
│   │   ├── Title (UI): "Pantry"
│   │   ├── AddButton (UI)
│   │   └── MenuButton (UI)
│   │
│   ├── SearchBar (UI)
│   │
│   ├── FilterBar (Feature)
│   │   ├── LocationTabs (UI)
│   │   │   ├── Tab: "Cabinet" [active]
│   │   │   ├── Tab: "Fridge"
│   │   │   └── Tab: "Freezer"
│   │   │
│   │   └── SortSelect (UI)
│   │       ├── Option: "Expiring Soon" [default]
│   │       ├── Option: "Name"
│   │       ├── Option: "Category"
│   │       └── Option: "Date Added"
│   │
│   ├── Container (Layout)
│   │   │
│   │   ├── ExpiringSection (Feature) [conditional: has expiring items]
│   │   │   ├── SectionHeader (UI)
│   │   │   │   ├── Icon: "⚠️"
│   │   │   │   └── Title: "EXPIRING SOON"
│   │   │   │
│   │   │   └── PantryItemList (Feature)
│   │   │       └── PantryItemCard (Feature) [repeated]
│   │   │           ├── Card (UI)
│   │   │           ├── ItemIcon (UI)
│   │   │           ├── ItemInfo (Feature)
│   │   │           │   ├── ItemName (UI)
│   │   │           │   ├── ItemDetails (UI)
│   │   │           │   ├── ExpirationBadge (UI) [variant: warning]
│   │   │           │   │   └── DaysRemaining (UI): "2 days"
│   │   │           │   └── Location (UI)
│   │   │           └── MenuButton (UI)
│   │   │               └── DropdownMenu (UI)
│   │   │                   ├── MenuItem: "Mark as Used"
│   │   │                   ├── MenuItem: "Add to List"
│   │   │                   ├── MenuItem: "Edit"
│   │   │                   └── MenuItem: "Delete"
│   │   │
│   │   └── CategoryList (Feature)
│   │       └── CategorySection (Feature) [repeated]
│   │           ├── CategoryHeader (UI) [collapsible]
│   │           │   ├── Icon (UI)
│   │           │   ├── CategoryName (UI)
│   │           │   ├── ItemCount (UI)
│   │           │   └── CollapseToggle (UI)
│   │           │
│   │           └── PantryItemList (Feature)
│   │               └── PantryItemCard (Feature) [repeated]
│   │                   └── [Same structure as above]
│   │
│   ├── EmptyState (UI) [conditional]
│   │   ├── Icon (UI)
│   │   ├── Heading (UI): "Your pantry is empty"
│   │   ├── Description (UI)
│   │   └── ButtonGroup (UI)
│   │       ├── Button: "Add Items to Pantry"
│   │       └── Button: "Scan Barcode"
│   │
│   ├── FloatingActionButton (UI)
│   │   └── Icon: "+"
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       └── [Same as Lists Screen]
│
└── AddToPantryModal (Feature) [conditional]
    └── [See Modal Hierarchy below]
```

---

## 7. Add to Pantry Modal

```
AddToPantryModal (Feature)
├── Modal (UI)
│   ├── ModalHeader (UI)
│   │   ├── CloseButton (UI)
│   │   └── Title (UI): "Add to Pantry"
│   │
│   ├── ModalContent (UI)
│   │   ├── Form (UI)
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Item"
│   │   │   │   └── Input (UI)
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Category"
│   │   │   │   └── Select (UI)
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Quantity"
│   │   │   │   └── QuantityInput (Feature)
│   │   │   │       ├── DecrementButton (UI): "−"
│   │   │   │       ├── Input (UI) [type: number]
│   │   │   │       └── IncrementButton (UI): "+"
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Expiration Date"
│   │   │   │   └── DatePickerInput (UI)
│   │   │   │       ├── Input (UI) [type: date]
│   │   │   │       └── QuickButton (UI): "Today"
│   │   │   │
│   │   │   ├── FormField (Feature)
│   │   │   │   ├── Label (UI): "Location"
│   │   │   │   └── Select (UI)
│   │   │   │       ├── Option: "Cabinet"
│   │   │   │       ├── Option: "Fridge"
│   │   │   │       └── Option: "Freezer"
│   │   │   │
│   │   │   └── FormField (Feature)
│   │   │       ├── Label (UI): "Notes (optional)"
│   │   │       └── Textarea (UI)
│   │   │
│   │   ├── Divider (UI)
│   │   │   └── Text: "OR"
│   │   │
│   │   └── Button (UI): "📷 Scan Barcode" [variant: outline]
│   │
│   └── ModalFooter (UI)
│       ├── Button (UI): "Cancel" [variant: outline]
│       └── Button (UI): "Add to Pantry" [variant: primary]
```

---

## 8. Meal Calendar Screen

```
MealPlanScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── MenuButton (UI)
│   │   ├── Title (UI): "Meal Plan"
│   │   ├── AddButton (UI)
│   │   └── MenuButton (UI)
│   │
│   ├── WeekNavigator (Feature)
│   │   ├── PrevButton (UI): "◄"
│   │   ├── WeekRange (UI): "Week of Feb 10-16"
│   │   └── NextButton (UI): "►"
│   │
│   ├── GenerateButton (UI) [sticky]
│   │   └── Button: "Generate Shopping List"
│   │
│   ├── Container (Layout)
│   │   └── MealCalendar (Feature)
│   │       └── DaySection (Feature) [repeated: 7 days]
│   │           ├── DayHeader (UI)
│   │           │   └── DateLabel (UI): "MON Feb 10"
│   │           │
│   │           └── MealSlots (Feature)
│   │               ├── MealSlot (Feature) [Breakfast]
│   │               │   ├── MealLabel (UI): "Breakfast"
│   │               │   ├── EmptySlot (UI) [if empty]
│   │               │   │   └── Button: "+ Add meal"
│   │               │   └── MealCard (Feature) [if filled]
│   │               │       ├── RecipeImage (UI)
│   │               │       ├── RecipeInfo (Feature)
│   │               │       │   ├── RecipeName (UI)
│   │               │       │   ├── RecipeMeta (UI)
│   │               │       │   │   ├── Time (UI)
│   │               │       │   │   └── Servings (UI)
│   │               │       └── MenuButton (UI)
│   │               │           └── DropdownMenu (UI)
│   │               │               ├── MenuItem: "View Recipe"
│   │               │               ├── MenuItem: "Replace"
│   │               │               └── MenuItem: "Remove"
│   │               │
│   │               ├── MealSlot (Feature) [Lunch]
│   │               │   └── [Same structure]
│   │               │
│   │               └── MealSlot (Feature) [Dinner]
│   │                   └── [Same structure]
│   │
│   ├── EmptyState (UI) [conditional]
│   │   └── [Prompt to add first meal]
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       └── [Same as Lists Screen]
│
└── RecipeSelectModal (Feature) [conditional]
    └── [See Modal Hierarchy below]
```

---

## 9. Recipe Collection Screen

```
RecipesScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── MenuButton (UI)
│   │   ├── Title (UI): "Recipes"
│   │   ├── ImportButton (UI): "🔗"
│   │   └── MenuButton (UI)
│   │
│   ├── SearchBar (UI)
│   │
│   ├── FilterBar (Feature)
│   │   ├── CategoryTabs (UI)
│   │   │   ├── Tab: "All" [active]
│   │   │   ├── Tab: "Breakfast"
│   │   │   ├── Tab: "Lunch"
│   │   │   └── Tab: "Dinner"
│   │   │
│   │   ├── SortSelect (UI)
│   │   │   ├── Option: "Recent"
│   │   │   ├── Option: "Name"
│   │   │   ├── Option: "Time"
│   │   │   └── Option: "Rating"
│   │   │
│   │   └── ViewToggle (UI)
│   │       ├── Button: "Grid" [active]
│   │       └── Button: "List"
│   │
│   ├── Container (Layout)
│   │   └── RecipeGrid (Feature) [or RecipeList]
│   │       └── RecipeCard (Feature) [repeated]
│   │           ├── Card (UI) [clickable]
│   │           ├── RecipeImage (UI)
│   │           │   └── FavoriteButton (UI) [overlay]
│   │           ├── RecipeInfo (Feature)
│   │           │   ├── RecipeName (UI)
│   │           │   ├── RecipeMeta (UI)
│   │           │   │   ├── Icon: Time (UI)
│   │           │   │   ├── Icon: Servings (UI)
│   │           │   │   └── Icon: Difficulty (UI)
│   │           │   └── CategoryTag (UI)
│   │           └── MenuButton (UI) [hover/long-press]
│   │               └── DropdownMenu (UI)
│   │                   ├── MenuItem: "View Details"
│   │                   ├── MenuItem: "Add to Meal Plan"
│   │                   ├── MenuItem: "Edit"
│   │                   └── MenuItem: "Delete"
│   │
│   ├── EmptyState (UI) [conditional]
│   │   └── [Prompt to add/import first recipe]
│   │
│   ├── FloatingActionButton (UI)
│   │   └── Icon: "+"
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       └── [Same as Lists Screen]
│
└── RecipeImportModal (Feature) [conditional]
    └── [See Modal Hierarchy below]
```

---

## 10. Recipe Detail Screen

```
RecipeDetailScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── BackButton (UI)
│   │   ├── MenuButton (UI)
│   │   └── FavoriteButton (UI)
│   │
│   ├── RecipeHero (Feature)
│   │   ├── RecipeImage (UI)
│   │   ├── RecipeTitle (UI)
│   │   ├── RecipeMeta (Feature)
│   │   │   ├── TimeLabel (UI): "⏱️ 45 min"
│   │   │   ├── ServingsLabel (UI): "👥 4 servings"
│   │   │   └── DifficultyLabel (UI): "🔥 Medium"
│   │   └── Button (UI): "Add to Meal Plan"
│   │
│   ├── TabNavigation (UI)
│   │   ├── Tab: "Ingredients" [active]
│   │   ├── Tab: "Instructions"
│   │   └── Tab: "Notes"
│   │
│   ├── Container (Layout)
│   │   │
│   │   ├── IngredientsTab (Feature) [conditional: active]
│   │   │   ├── ServingsControl (Feature)
│   │   │   │   ├── Label: "Servings:"
│   │   │   │   ├── DecrementButton (UI)
│   │   │   │   ├── ServingsValue (UI)
│   │   │   │   └── IncrementButton (UI)
│   │   │   │
│   │   │   ├── IngredientList (Feature)
│   │   │   │   └── IngredientItem (Feature) [repeated]
│   │   │   │       ├── Checkbox (UI)
│   │   │   │       ├── IngredientText (UI)
│   │   │   │       └── PantryBadge (UI) [conditional: in pantry]
│   │   │   │
│   │   │   ├── Button (UI): "Add to Shopping List"
│   │   │   │
│   │   │   └── PantrySummary (Feature)
│   │   │       ├── Text: "3 items in pantry"
│   │   │       └── Text: "7 items needed"
│   │   │
│   │   ├── InstructionsTab (Feature) [conditional: active]
│   │   │   └── InstructionList (Feature)
│   │   │       └── InstructionStep (Feature) [repeated]
│   │   │           ├── StepNumber (UI)
│   │   │           ├── StepText (UI)
│   │   │           └── StepImage (UI) [optional]
│   │   │
│   │   └── NotesTab (Feature) [conditional: active]
│   │       └── NotesSection (Feature)
│   │           ├── PublicNotes (UI) [from recipe]
│   │           └── PersonalNotes (Feature)
│   │               ├── Textarea (UI)
│   │               └── Button: "Save Notes"
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       └── [Same as Lists Screen]
```

---

## 11. Budget/Spending History Screen

```
BudgetScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── MenuButton (UI)
│   │   ├── Title (UI): "Budget & Spending"
│   │   └── MenuButton (UI)
│   │
│   ├── DateRangeSelector (Feature)
│   │   ├── Tab: "Week"
│   │   ├── Tab: "Month" [active]
│   │   └── Tab: "Year"
│   │
│   ├── Container (Layout)
│   │   │
│   │   ├── MonthSelector (Feature)
│   │   │   ├── PrevButton (UI)
│   │   │   ├── MonthLabel (UI): "February 2026"
│   │   │   └── NextButton (UI)
│   │   │
│   │   ├── SpendingSummary (Feature)
│   │   │   ├── Card (UI)
│   │   │   ├── TotalSpent (UI)
│   │   │   │   ├── Label: "Total Spent"
│   │   │   │   └── Amount (UI): "$342.15"
│   │   │   ├── BudgetProgress (Feature)
│   │   │   │   ├── BudgetLabel (UI): "Budget: $400.00"
│   │   │   │   ├── ProgressBar (UI)
│   │   │   │   └── RemainingLabel (UI): "Remaining: $57.85"
│   │   │   └── ComparisonText (UI): "12% less than last month"
│   │   │
│   │   ├── TrendChart (Feature)
│   │   │   ├── Card (UI)
│   │   │   ├── ChartTitle (UI): "Spending Trend"
│   │   │   └── LineChart (UI)
│   │   │       └── [Chart library component]
│   │   │
│   │   ├── CategoryBreakdown (Feature)
│   │   │   ├── SectionHeader (UI): "SPENDING BY CATEGORY"
│   │   │   │
│   │   │   └── CategoryList (Feature)
│   │   │       └── CategorySpendingCard (Feature) [repeated]
│   │   │           ├── CategoryIcon (UI)
│   │   │           ├── CategoryInfo (Feature)
│   │   │           │   ├── CategoryName (UI)
│   │   │           │   ├── Amount (UI)
│   │   │           │   └── Percentage (UI)
│   │   │           └── ProgressBar (UI)
│   │   │
│   │   ├── RecentTrips (Feature)
│   │   │   ├── SectionHeader (UI): "RECENT TRIPS"
│   │   │   │
│   │   │   └── TripList (Feature)
│   │   │       └── TripCard (Feature) [repeated]
│   │   │           ├── Card (UI) [clickable]
│   │   │           ├── TripIcon (UI)
│   │   │           ├── TripInfo (Feature)
│   │   │           │   ├── ListName (UI)
│   │   │           │   ├── TripDate (UI)
│   │   │           │   ├── StoreName (UI)
│   │   │           │   └── TripSummary (UI)
│   │   │           │       ├── ItemCount (UI)
│   │   │           │       └── TotalAmount (UI)
│   │   │           └── ViewButton (UI)
│   │   │
│   │   └── EmptyState (UI) [conditional]
│   │       └── [No spending data message]
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       └── [Same as Lists Screen]
```

---

## 12. Settings Screen

```
SettingsScreen (Page)
├── AppLayout (Layout)
│   ├── Header (Layout)
│   │   ├── BackButton (UI)
│   │   └── Title (UI): "Settings"
│   │
│   ├── Container (Layout)
│   │   └── SettingsSections (Feature)
│   │       │
│   │       ├── SettingsSection (Feature) [Account]
│   │       │   ├── SectionHeader (UI): "ACCOUNT"
│   │       │   │
│   │       │   └── SettingsList (Feature)
│   │       │       ├── SettingsItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Profile"
│   │       │       │   └── ChevronRight (UI)
│   │       │       │
│   │       │       ├── SettingsItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Change Password"
│   │       │       │   └── ChevronRight (UI)
│   │       │       │
│   │       │       └── SettingsItem (Feature)
│   │       │           ├── Icon (UI)
│   │       │           ├── Label (UI): "Notifications"
│   │       │           └── ChevronRight (UI)
│   │       │
│   │       ├── SettingsSection (Feature) [App Settings]
│   │       │   ├── SectionHeader (UI): "APP SETTINGS"
│   │       │   │
│   │       │   └── SettingsList (Feature)
│   │       │       ├── SettingsToggleItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Dark Mode"
│   │       │       │   └── Toggle (UI)
│   │       │       │
│   │       │       ├── SettingsItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Default Store"
│   │       │       │   └── ChevronRight (UI)
│   │       │       │
│   │       │       ├── SettingsItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Store Locations"
│   │       │       │   └── ChevronRight (UI)
│   │       │       │
│   │       │       ├── SettingsToggleItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Location Services"
│   │       │       │   └── Toggle (UI)
│   │       │       │
│   │       │       └── SettingsItem (Feature)
│   │       │           ├── Icon (UI)
│   │       │           ├── Label (UI): "Currency"
│   │       │           └── ChevronRight (UI)
│   │       │
│   │       ├── SettingsSection (Feature) [Data & Privacy]
│   │       │   ├── SectionHeader (UI): "DATA & PRIVACY"
│   │       │   │
│   │       │   └── SettingsList (Feature)
│   │       │       ├── SettingsItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Export Data"
│   │       │       │   └── ChevronRight (UI)
│   │       │       │
│   │       │       ├── SettingsItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Clear Cache"
│   │       │       │   └── ChevronRight (UI)
│   │       │       │
│   │       │       └── SettingsItem (Feature)
│   │       │           ├── Icon (UI)
│   │       │           ├── Label (UI): "Privacy Policy"
│   │       │           └── ChevronRight (UI)
│   │       │
│   │       ├── SettingsSection (Feature) [About]
│   │       │   ├── SectionHeader (UI): "ABOUT"
│   │       │   │
│   │       │   └── SettingsList (Feature)
│   │       │       ├── SettingsItem (Feature)
│   │       │       │   ├── Icon (UI)
│   │       │       │   ├── Label (UI): "Version 1.0.0"
│   │       │       │   └── ChevronRight (UI)
│   │       │       │
│   │       │       └── SettingsItem (Feature)
│   │       │           ├── Icon (UI)
│   │       │           ├── Label (UI): "Help & Support"
│   │       │           └── ChevronRight (UI)
│   │       │
│   │       └── SignOutSection (Feature)
│   │           └── Button (UI): "Sign Out" [variant: destructive]
│   │
│   └── BottomNavigation (Layout) [mobile only]
│       └── [Same as Lists Screen]
```

---

## Common Component Patterns

### AppLayout (Used on all pages)

```
AppLayout (Layout)
├── Header (Layout) [varies by page]
├── Main (Layout)
│   └── [Page-specific content]
├── Footer (Layout) [optional]
└── BottomNavigation (Layout) [mobile only]
    ├── NavItem (UI) × 5
    └── ActiveIndicator (UI)
```

### Modal Pattern (All modals follow this structure)

```
Modal (UI)
├── Overlay (UI) [backdrop]
├── ModalContainer (UI)
│   ├── ModalHeader (UI)
│   │   ├── CloseButton (UI)
│   │   └── Title (UI)
│   │
│   ├── ModalContent (UI)
│   │   └── [Content varies by modal type]
│   │
│   └── ModalFooter (UI)
│       ├── Button (UI) [Cancel/Secondary]
│       └── Button (UI) [Primary action]
│
└── FocusTrap (Utility) [accessibility]
```

### Card Pattern (Lists, Pantry, Recipes)

```
Card (UI)
├── CardHeader (UI) [optional]
│   ├── Title (UI)
│   └── Actions (UI)
│
├── CardContent (UI)
│   └── [Content varies]
│
└── CardFooter (UI) [optional]
    └── Actions (UI)
```

### Form Pattern (All forms follow this structure)

```
Form (UI)
└── FormField (Feature) [repeated]
    ├── Label (UI)
    ├── Input (UI) / Select (UI) / Textarea (UI)
    ├── FormDescription (UI) [optional]
    └── ErrorMessage (UI) [conditional]
```

---

## Component Inventory Summary

### By Category

**UI Components (Generic):** 50+

- Button, Input, Checkbox, Label, Card, Badge, Avatar, Spinner, etc.

**Layout Components:** 12

- AppLayout, Header, Footer, Container, Modal, BottomNavigation, etc.

**Feature Components (Domain-specific):** 70+

- ListCard, ItemInput, BudgetProgress, PantryItemCard, RecipeCard, etc.

### Component Reuse

**High Reuse (10+ instances):**

- Button, Card, Input, Icon, Badge, Avatar

**Medium Reuse (5-10 instances):**

- FormField, MenuButton, DropdownMenu, ProgressBar

**Low Reuse (1-4 instances):**

- Specialized feature components (ItemInput, BudgetProgress, etc.)

---

## Implementation Priority

### Phase 1: Core UI (Existing ✅)

- Button, Input, Checkbox, Label, Card, Badge, Avatar, Spinner

### Phase 2: Layout (Existing ✅)

- Header, Footer, Container

### Phase 3: Forms (Existing ✅)

- FormField, Select, Textarea

### Phase 4: Feature Components (Next)

- ListCard, ItemInput, CategorySection, ShareModal
- PantryItemCard, RecipeCard, MealSlot
- BudgetProgress, SpendingChart

---

## Summary

**Total Screens Analyzed:** 12 major screens + modals  
**Component Hierarchies:** Complete tree structures for all screens  
**Component Categories:** UI (50+), Layout (12), Feature (70+)

**Key Patterns Identified:**

- Consistent modal structure across all dialogs
- Reusable card pattern for lists, pantry, recipes
- Standard form field pattern with validation
- Bottom navigation for mobile, sidebar for desktop

**Next Steps:** Specify interactions and accessibility → [interactions.md](interactions.md)
