import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

// Types
interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  storeId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: true;
  data: Category[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CategoryResponse {
  success: true;
  data: Category;
}

interface CategoryFilters {
  page?: number;
  limit?: number;
  storeId?: string;
}

interface CreateCategoryData {
  name: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  storeId?: string;
}

interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

// Query keys factory
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Hooks
export function useCategories(filters: CategoryFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.storeId) params.set('storeId', filters.storeId);

  const queryString = params.toString();
  const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => api.get<CategoriesResponse>(endpoint),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => api.get<CategoryResponse>(`/categories/${id}`),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) =>
      api.post<CategoryResponse>('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      api.patch<CategoryResponse>(`/categories/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { categoryIds: string[] }) =>
      api.post('/categories/reorder', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
