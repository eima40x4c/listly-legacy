/**
 * API Hooks Barrel Export
 *
 * Central export for all API query hooks.
 * Import API hooks from this file for cleaner imports.
 *
 * @example
 * ```tsx
 * import { useLists, useCreateItem } from '@/hooks/api';
 * ```
 */

// Lists
export {
  listKeys,
  useArchiveList,
  useCompleteList,
  useCreateList,
  useDeleteList,
  useDuplicateList,
  useList,
  useLists,
  useUpdateList,
} from './useLists';

// Items
export {
  itemKeys,
  useBulkAddItems,
  useCheckItem,
  useClearCompletedItems,
  useCreateItem,
  useDeleteItem,
  useListItem,
  useListItems,
  useUpdateItem,
} from './useItems';

// Categories
export {
  categoryKeys,
  useCategories,
  useCategory,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from './useCategories';

// Users
export {
  useCurrentUser,
  useDeleteUser,
  userKeys,
  useUpdatePreferences,
  useUpdateUser,
  useUserPreferences,
} from './useUsers';
