'use client';

import { Palette, Tag, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface EditListModalProps {
  listId: string;
  listName: string;
  listIcon?: string;
  listColor?: string;
  listBudget?: number;
  onClose: () => void;
  onUpdate: () => void;
}

const ICONS = ['🛒', '📝', '🏪', '🏠', '🎁', '🎉', '💼', '🌟'];
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export function EditListModal({
  listId,
  listName,
  listIcon,
  listColor,
  listBudget,
  onClose,
  onUpdate,
}: EditListModalProps) {
  const router = useRouter();
  const [name, setName] = useState(listName);
  const [icon, setIcon] = useState(listIcon || '🛒');
  const [color, setColor] = useState(listColor || COLORS[0]);
  const [budget, setBudget] = useState(listBudget?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // ... (existing submit logic)
      setError('');

      if (!name.trim()) {
        setError('List name is required');
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/v1/lists/${listId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            icon,
            color,
            budget: budget ? parseFloat(budget) : null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update list');
        }

        onUpdate();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update list');
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, icon, color, budget, listId, onClose, onUpdate]
  );

  const handleDelete = useCallback(async () => {
    // Replaced confirm with state
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v1/lists/${listId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete list');
      }

      router.push('/lists');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
      setIsSubmitting(false);
    }
  }, [listId, router]);

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="animate-in zoom-in-95 w-full max-w-md overflow-hidden rounded-xl bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        {showDeleteConfirm ? (
          <div className="p-6">
            <h3 className="mb-2 text-lg font-semibold">Delete List?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to delete "{listName}"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isSubmitting}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Edit List</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium"
                >
                  List Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My Shopping List"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  <Tag className="mb-1 mr-1.5 inline h-3.5 w-3.5" /> Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-lg text-xl transition-all',
                        icon === emoji
                          ? 'scale-110 bg-primary/10 ring-2 ring-primary'
                          : 'hover:bg-muted'
                      )}
                      disabled={isSubmitting}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  <Palette className="mb-1 mr-1.5 inline h-3.5 w-3.5" /> Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'h-8 w-8 rounded-full transition-transform',
                        color === c
                          ? 'scale-110 ring-2 ring-offset-2 ring-offset-background'
                          : 'hover:scale-105'
                      )}
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? 'transparent' : undefined,
                      }}
                      disabled={isSubmitting}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Budget{' '}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-7 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isSubmitting}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>

              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete List
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
