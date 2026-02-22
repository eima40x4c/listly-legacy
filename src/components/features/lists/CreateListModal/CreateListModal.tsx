/**
 * CreateListModal Component
 *
 * Modal for creating new shopping lists.
 * Layout order: Name → Description → Items (mandatory, with quantity) → Budget (optional)
 * Icon picker and Color picker live in a collapsed "Customize" section.
 * Create button pulses when all required fields are filled.
 *
 * @module components/features/lists/CreateListModal
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  Minus,
  Palette,
  Plus,
  ShoppingCart,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/hooks/api/useCategories';
import { useCreateList, useLists } from '@/hooks/api/useLists';
import { COMMON_ITEMS } from '@/lib/constants/common-items';
import { cn } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/formatCurrency';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ListItem {
  name: string;
  quantity: number;
  categoryId?: string;
  unit?: string;
}

const PRESET_NAMES = [
  'Groceries',
  'Weekly Shopping',
  'Hardware Store',
  'Pharmacy',
  'Party Supplies',
  'Weekend Trip',
  'Meal Prep',
  'Costco Run',
];

const ICON_OPTIONS = [
  '🛒',
  '🏠',
  '🎄',
  '⭐',
  '🍽️',
  '🚗',
  '📚',
  '🎁',
  '🐶',
  '🌿',
  '💊',
  '🔧',
  '👶',
  '🧹',
  '🎉',
  '💄',
  '🏋️',
  '🎮',
  '📱',
  '✈️',
  '🎵',
  '🍎',
  '☕',
  '🍰',
  '🥩',
  '🐟',
  '🧀',
  '🥛',
  '🍜',
  '🥗',
  '🧃',
  '🍺',
];

const COLOR_OPTIONS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#64748b',
  '#78716c',
];

const UNITS = ['pcs', 'kg', 'g', 'lb', 'oz', 'ml', 'l'];

export function CreateListModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateListModalProps) {
  const router = useRouter();
  const currency = useSettingsStore((s) => s.currency);
  const currencySymbol = getCurrencySymbol(currency);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛒');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [budget, setBudget] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [itemInput, setItemInput] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  // Button pulse animation state
  const [shouldPulse, setShouldPulse] = useState(false);

  // Suggestions logic
  const { data: existingLists } = useLists({ limit: 100 });

  const suggestionSource = useMemo(() => {
    const listNames = existingLists?.map((l) => l.name) || [];
    return Array.from(new Set([...PRESET_NAMES, ...listNames]));
  }, [existingLists]);

  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const nameSuggestions = useMemo(() => {
    if (!name.trim()) return [];
    const lower = name.toLowerCase();
    return suggestionSource
      .filter(
        (s) => s.toLowerCase().includes(lower) && s.toLowerCase() !== lower
      )
      .slice(0, 5);
  }, [name, suggestionSource]);

  const handleNameSelect = (suggestion: string) => {
    setName(suggestion);
    setShowNameSuggestions(false);
  };

  // Required: name + at least 1 item
  const isFormValid = useMemo(
    () => name.trim().length > 0 && items.length > 0,
    [name, items]
  );

  useEffect(() => {
    if (isFormValid) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isFormValid]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSelectedIcon('🛒');
      setSelectedColor('#6366f1');
      setBudget('');
      setItems([]);
      setItemInput('');
      setShowCustomize(false);
      setShouldPulse(false);
      setShowConfirmDiscard(false);
    }
  }, [isOpen]);

  // --- Item Logic ---
  const { data: categoriesResponse } = useCategories();
  const categories = useMemo(
    () => categoriesResponse?.data || [],
    [categoriesResponse]
  );

  const categoryOptions = useMemo(() => {
    return [
      { value: 'uncategorized', label: 'Uncategorized' },
      ...categories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: <span>{c.icon}</span>,
      })),
    ];
  }, [categories]);

  // ... (in component)

  // Derive known items for autocomplete & auto-categorization
  const knownItems = useMemo(() => {
    const map = new Map<string, { name: string; categoryId?: string }>();

    // Add common items first
    COMMON_ITEMS.forEach((item) => {
      map.set(item.name.toLowerCase(), {
        name: item.name,
        // We need to map common item category IDs to actual category IDs if possible,
        // but for now we just use the string.
        // Actually, CreateListModal expects categoryId to be a UUID if we use the select.
        // But wait, the categories from DB have UUIDs. COMMON_ITEMS have 'produce'.
        // We might need to map them or leave them uncategorized if no match.
        // Let's just use the name for suggestion and leave category logic for later or simple matching.
        // For now, let's NOT map categoryId from COMMON_ITEMS unless we have a mapping.
      });
    });

    existingLists?.forEach((list) => {
      list.items?.forEach((item) => {
        if (item.name) {
          map.set(item.name.toLowerCase(), {
            name: item.name,
            categoryId: item.category?.id,
          });
        }
      });
    });
    return map;
  }, [existingLists]);

  const [showItemSuggestions, setShowItemSuggestions] = useState(false);

  const itemSuggestions = useMemo(() => {
    if (!itemInput.trim()) return [];
    const lower = itemInput.toLowerCase();
    const matches: string[] = [];

    // Check known items (includes common items now)
    for (const [key, val] of knownItems.entries()) {
      if (key.includes(lower) && key !== lower) {
        matches.push(val.name);
      }
    }

    // Fallback to searching COMMON_ITEMS directly if not in knownItems (double check)
    // Actually knownItems already has them.

    // Limit to 5
    return matches.slice(0, 5);
  }, [itemInput, knownItems]);

  const handleAddItem = useCallback(
    (itemNameOverride?: string) => {
      const nameToAdd =
        typeof itemNameOverride === 'string'
          ? itemNameOverride
          : itemInput.trim();
      if (!nameToAdd) return;

      if (
        !items.some((i) => i.name.toLowerCase() === nameToAdd.toLowerCase())
      ) {
        const known = knownItems.get(nameToAdd.toLowerCase());

        setItems((prev) => [
          ...prev,
          {
            name: known?.name || nameToAdd,
            quantity: 1,
            categoryId: known?.categoryId, // Auto-categorize if known
          },
        ]);
        setItemInput('');
        setShowItemSuggestions(false);

        // Pulse the create button after adding item
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 1200);
      }
    },
    [itemInput, items, knownItems]
  );

  const handleUpdateItemCategory = useCallback(
    (itemName: string, categoryId: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.name === itemName
            ? {
                ...item,
                categoryId:
                  categoryId === 'uncategorized' ? undefined : categoryId,
              }
            : item
        )
      );
    },
    []
  );

  const handleRemoveItem = useCallback((itemName: string) => {
    setItems((prev) => prev.filter((i) => i.name !== itemName));
  }, []);

  const handleQuantityChange = useCallback(
    (itemName: string, delta: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.name === itemName
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        )
      );
    },
    []
  );

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddItem();
      }
    },
    [handleAddItem]
  );

  const createListMutation = useCreateList();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Fire the Create List Mutation (Optimistic)
      const listData = await createListMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        color: selectedColor,
        budget: budget ? parseFloat(budget) : undefined,
      });

      const newListId = listData?.id || `temp-list-${Date.now()}`;

      // 2. Add Items Optimistically using raw caching or a hook if available
      // Since useCreateItem requires a listId, and offline temp lists won't work perfectly
      // without server IDs, we'll manually push them to the queryClient queue or use standard fetch if online.
      if (items.length > 0) {
        if (!navigator.onLine) {
          // Queue items for later or optimistically push them onto the list cache
          const previousItems = queryClient.getQueryData<{ data: unknown[] }>([
            'items',
            'list',
            newListId,
          ]);

          queryClient.setQueryData(['items', 'list', newListId], {
            ...previousItems,
            data: items.map((item, idx) => ({
              id: `temp-item-${Date.now()}-${idx}`,
              listId: newListId,
              name: item.name,
              quantity: item.quantity,
              isChecked: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          });
        } else {
          await Promise.all(
            items.map((item) =>
              fetch(`/api/v1/lists/${newListId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  categoryId: item.categoryId,
                }),
              })
            )
          );
        }
      }

      onSuccess?.();
      onClose();
      if (navigator.onLine) {
        router.refresh();
      }
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is dirty
  const isDirty = useMemo(
    () =>
      name.trim().length > 0 ||
      items.length > 0 ||
      description.trim().length > 0 ||
      budget !== '',
    [name, items, description, budget]
  );

  const handleClose = () => {
    if (isDirty) {
      setShowConfirmDiscard(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="animate-modal-backdrop fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="animate-modal-enter relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:max-w-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Create new list"
        >
          {/* Custom Confirm Discard Overlay */}
          {showConfirmDiscard && (
            <div className="animate-in fade-in absolute inset-0 z-[60] flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-semibold">Discard changes?</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  You have unsaved changes. Are you sure you want to discard
                  them?
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDiscard(false)}
                  >
                    Keep Editing
                  </Button>
                  <Button variant="danger" onClick={onClose}>
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b bg-background px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Create List</h2>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-6"
            autoComplete="off"
          >
            {/* ... form content ... */}
            {/* ===== 1. List Name (required) ===== */}
            <div className="relative">
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="list-name"
              >
                List Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="list-name"
                placeholder="e.g. Weekly Groceries"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowNameSuggestions(true);
                }}
                onFocus={() => setShowNameSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowNameSuggestions(false), 200)
                }
                autoFocus
                required
                autoComplete="off"
              />
              {/* Suggestions Dropdown */}
              {showNameSuggestions && nameSuggestions.length > 0 && (
                <div className="animate-in fade-in zoom-in-95 absolute top-full z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md ring-1 ring-black/5 duration-100">
                  <ul className="max-h-40 overflow-auto py-1">
                    {nameSuggestions.map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted"
                          onMouseDown={(e) => e.preventDefault()} // Prevent blur
                          onClick={() => handleNameSelect(suggestion)}
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ===== 2. Description (optional) ===== */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="list-desc"
              >
                Description{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                id="list-desc"
                className="flex min-h-[60px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add notes about this list..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* ===== 3. Items (required — at least 1) ===== */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Items <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Add an item..."
                    value={itemInput}
                    onChange={(e) => {
                      setItemInput(e.target.value);
                      setShowItemSuggestions(true);
                    }}
                    onFocus={() => setShowItemSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowItemSuggestions(false), 200)
                    }
                    onKeyDown={handleItemKeyDown}
                    autoComplete="off"
                  />
                  {/* Item Suggestions */}
                  {showItemSuggestions && itemSuggestions.length > 0 && (
                    <div className="animate-in fade-in zoom-in-95 absolute top-full z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md ring-1 ring-black/5 duration-100">
                      <ul className="max-h-40 overflow-auto py-1">
                        {itemSuggestions.map((suggestion) => (
                          <li key={suggestion}>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleAddItem(suggestion)}
                            >
                              {suggestion}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem()}
                  disabled={!itemInput.trim()}
                  className="shrink-0 px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Item List with Quantity Controls */}
              {items.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="animate-slide-in-top flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                        <span className="truncate text-sm font-medium">
                          {item.name}
                        </span>
                        {/* Category Selector */}
                        <CustomSelect
                          options={categoryOptions}
                          value={item.categoryId || 'uncategorized'}
                          onChange={(val) =>
                            handleUpdateItemCategory(item.name, val)
                          }
                          className="w-full max-w-[150px] border-none bg-transparent p-0 shadow-none hover:bg-transparent"
                        />
                      </div>

                      {/* Quantity controls */}
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.name, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-16 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-medium">
                              {item.quantity}
                            </span>
                            <select
                              className="w-10 bg-transparent text-xs text-muted-foreground focus:outline-none"
                              value={item.unit}
                              onChange={(e) => {
                                setItems((prev) =>
                                  prev.map((i) =>
                                    i.name === item.name
                                      ? { ...i, unit: e.target.value }
                                      : i
                                  )
                                );
                              }}
                            >
                              {UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.name, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.name)}
                        className="ml-1 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {items.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Add at least one item to create a list.
                </p>
              )}
            </div>

            {/* ===== 4. Budget (optional) ===== */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="list-budget"
              >
                Budget{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  {currencySymbol}
                </span>
                <input
                  id="list-budget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm [appearance:textfield] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* ===== 5. Collapsed "Customize" Section (icon + color) ===== */}
            <div className="rounded-lg border">
              <button
                type="button"
                onClick={() => setShowCustomize(!showCustomize)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Customize
                  <span className="text-lg leading-none">{selectedIcon}</span>
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    showCustomize && 'rotate-180'
                  )}
                />
              </button>

              {showCustomize && (
                <div className="animate-dropdown-enter space-y-4 border-t px-4 py-4">
                  {/* Icon Picker */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Icon
                    </label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {ICON_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedIcon(emoji)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all',
                            selectedIcon === emoji
                              ? 'scale-110 bg-primary/15 ring-2 ring-primary'
                              : 'bg-muted/50 hover:bg-muted'
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'h-8 w-8 rounded-full transition-all',
                            selectedColor === color
                              ? 'scale-110'
                              : 'hover:scale-105'
                          )}
                          style={{
                            backgroundColor: color,
                            ...(selectedColor === color
                              ? {
                                  boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${color}`,
                                }
                              : {}),
                          }}
                          aria-label={`Color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== Footer ===== */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                isLoading={isSubmitting}
                className={cn(
                  'flex-1',
                  shouldPulse && isFormValid && 'animate-button-pulse-ready'
                )}
              >
                Create List
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

CreateListModal.displayName = 'CreateListModal';
