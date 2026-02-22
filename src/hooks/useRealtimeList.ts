import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase/client';

import { itemKeys } from './api/useItems';

type Payload = {
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

export function useRealtimeList(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listId || !supabase) return;

    const channel = supabase
      .channel(`list:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
          filter: `list_id=eq.${listId}`,
        },
        (_payload: Payload) => {
          // Fire invalidation immediately to ensure data consistency as a fallback
          queryClient.invalidateQueries({
            queryKey: itemKeys.list(listId),
            exact: true,
          });

          // Direct cache update for instant UI response
          queryClient.setQueryData(
            itemKeys.list(listId),
            (oldData: unknown) => {
              const typedData = oldData as { data?: unknown[] } | undefined;
              if (
                !typedData ||
                !typedData.data ||
                !Array.isArray(typedData.data)
              ) {
                return oldData;
              }

              const currentItems = typedData.data as Record<string, unknown>[];

              // Helper to safely convert snake_case to camelCase
              const toCamelCase = (snakeObj: unknown) => {
                if (!snakeObj || typeof snakeObj !== 'object') return {};
                const camelObj: Record<string, unknown> = {};
                const obj = snakeObj as Record<string, unknown>;
                for (const key in obj) {
                  const camelKey = key.replace(/([-_][a-z])/g, (group) =>
                    group.toUpperCase().replace('-', '').replace('_', '')
                  );
                  camelObj[camelKey] = obj[key];
                }
                return camelObj;
              };

              if (_payload.eventType === 'INSERT') {
                const newItem = toCamelCase(_payload.new);
                if (!newItem.id) return oldData; // Invalid payload

                if (
                  currentItems.some(
                    (item: Record<string, unknown>) => item.id === newItem.id
                  )
                ) {
                  return oldData; // Already exists
                }

                // Ensure critical structure
                if (!newItem.category) {
                  newItem.category = {
                    id: 'uncategorized',
                    name: 'Uncategorized',
                  };
                }

                return {
                  ...typedData,
                  data: [...currentItems, newItem],
                };
              }

              if (_payload.eventType === 'UPDATE') {
                const updatedItem = toCamelCase(_payload.new);
                if (!updatedItem.id) return oldData;

                return {
                  ...typedData,
                  data: currentItems.map((item: Record<string, unknown>) =>
                    item.id === updatedItem.id
                      ? {
                          ...item,
                          ...updatedItem,
                          // Preserve relations if not in update payload
                          category: updatedItem.category || item.category,
                          addedBy: updatedItem.addedBy || item.addedBy,
                        }
                      : item
                  ),
                };
              }

              if (_payload.eventType === 'DELETE') {
                const oldItem = toCamelCase(_payload.old);
                if (!oldItem.id) return oldData;

                return {
                  ...typedData,
                  data: currentItems.filter(
                    (item: Record<string, unknown>) => item.id !== oldItem.id
                  ),
                };
              }

              return oldData;
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [listId, queryClient]);
}
