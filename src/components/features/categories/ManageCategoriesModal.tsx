'use client';

import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/hooks/api/useCategories';
import { cn } from '@/lib/utils';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = [
  '🍎',
  '🥦',
  '🥩',
  '🧀',
  '🥖',
  '🥫',
  '❄️',
  '🧃',
  '🧹',
  '💊',
  '🐶',
  '👶',
  '👕',
  '🎁',
  '🚗',
  '⛺',
  '🎉',
  '📚',
  '🎮',
  '💸',
  '🏠',
  '✈️',
];
const COLOR_OPTIONS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-slate-500',
];

export function ManageCategoriesModal({
  isOpen,
  onClose,
}: ManageCategoriesModalProps) {
  const { data: categoriesResponse } = useCategories();
  const categories = categoriesResponse?.data || [];

  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍎');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        icon: selectedEmoji,
        color: selectedColor,
      });
      setNewCategoryName('');
      toast.success('Category created');
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category? Items will be uncategorized.')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast.success('Category deleted');
      } catch {
        toast.error('Failed to delete category');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal Container with Overflow handling */}
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div className="relative my-auto flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-background shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Manage Categories</h2>
            <button onClick={onClose} className="rounded p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
            {/* Create New */}
            <form
              onSubmit={handleCreate}
              className="space-y-4 rounded-lg border bg-muted/20 p-4"
            >
              <h3 className="text-sm font-medium">Add New Category</h3>

              <div className="flex gap-2">
                <Input
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Emoji Picker */}
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-muted',
                        selectedEmoji === emoji &&
                          'bg-primary/20 ring-1 ring-primary'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'h-6 w-6 rounded-full transition-transform hover:scale-105',
                        color,
                        selectedColor === color &&
                          'ring-2 ring-primary ring-offset-2'
                      )}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!newCategoryName.trim() || createCategory.isPending}
                className="w-full"
              >
                {createCategory.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </form>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Existing Categories</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories found.
                </p>
              ) : (
                <div className="grid gap-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-lg">
                          {cat.icon || '📁'}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium">{cat.name}</span>
                          <div
                            className={cn(
                              'h-1 w-12 rounded-full',
                              cat.color || 'bg-gray-200'
                            )}
                          />
                        </div>
                      </div>
                      {!cat.isDefault && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
