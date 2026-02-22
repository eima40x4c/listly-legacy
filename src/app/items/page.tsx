'use client';

import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  useDeleteItemHistory,
  useItemHistory,
} from '@/hooks/api/useItemHistory';

export default function ManageItemsPage() {
  const [search, setSearch] = useState('');
  const { data: historyResponse, isLoading } = useItemHistory();
  const deleteItem = useDeleteItemHistory();

  const items = historyResponse || [];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (itemName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${itemName}" from your history? It will no longer appear in suggestions.`
      )
    ) {
      await deleteItem.mutateAsync(itemName);
    }
  };

  return (
    <AppShell>
      <Container className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manage Items</h1>
          <p className="text-muted-foreground">
            Manage your item history and suggestions.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading history...
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Card
                key={item.name}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.category?.icon || '📦'}</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Used {item.useCount} times · Last used{' '}
                      {new Date(item.lastUsedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(item.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                {search
                  ? 'No items found matching your search.'
                  : 'No item history found.'}
              </div>
            )}
          </div>
        )}
      </Container>
    </AppShell>
  );
}
