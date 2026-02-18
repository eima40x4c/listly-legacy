import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export interface ItemHistoryEntry {
  name: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
  lastUsedAt: string;
  useCount: number;
}

interface ItemHistoryResponse {
  success: true;
  data: ItemHistoryEntry[];
}

export const itemHistoryKeys = {
  all: ['item-history'] as const,
  list: () => [...itemHistoryKeys.all, 'list'] as const,
};

export function useItemHistory() {
  return useQuery({
    queryKey: itemHistoryKeys.list(),
    queryFn: async () => {
      const response = await api.get<ItemHistoryResponse>('/items/history');
      return response.data;
    },
  });
}

export function useDeleteItemHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemName: string) =>
      api.delete(`/items/history/${encodeURIComponent(itemName)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemHistoryKeys.list() });
    },
  });
}
