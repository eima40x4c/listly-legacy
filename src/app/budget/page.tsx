/**
 * Budget & Spending History Screen
 *
 * Wireframe §11: Budget overview with date range selector,
 * spending summary, monthly budget, category breakdown.
 * Uses mock data until backend API routes are built.
 */

'use client';

import { useQueries } from '@tanstack/react-query';
import { BarChart3, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ManageCategoriesModal } from '@/components/features/categories/ManageCategoriesModal';
import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useLists } from '@/hooks/api/useLists';
import { cn } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/formatCurrency';
import { useSettingsStore } from '@/stores';

// --- Date Ranges ---
const DATE_RANGES = ['This Month', 'Last Month', 'All Time'] as const;

export default function BudgetPage() {
  const [dateRange, setDateRange] = useState<string>('This Month');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const { currency } = useSettingsStore();

  const currencySymbol = getCurrencySymbol(currency);

  // 1. Fetch all lists (simple filter for now, ideally backend filters by date)
  const { data: lists } = useLists({ limit: 50 }); // Fetch last 50 lists

  // 2. We need list details to get *actual price* of items
  // This is expensive (N+1), but necessary without a stats endpoint.
  // We'll limit to the visible lists or recent ones.
  const relevantListIds = useMemo(() => {
    if (!lists) return [];
    // Filter by date range (client-side for now)
    const now = new Date();
    return lists
      .filter((list) => {
        const listDate = new Date(list.createdAt);
        if (dateRange === 'This Month') {
          return (
            listDate.getMonth() === now.getMonth() &&
            listDate.getFullYear() === now.getFullYear()
          );
        }
        if (dateRange === 'Last Month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return (
            listDate.getMonth() === lastMonth.getMonth() &&
            listDate.getFullYear() === lastMonth.getFullYear()
          );
        }
        return true;
      })
      .map((l) => l.id);
  }, [lists, dateRange]);

  const listDetailsQueries = useQueries({
    queries: relevantListIds.map((id) => ({
      queryKey: ['list', 'detail', id],
      queryFn: async () => {
        // We can't use the hook directly in callback, so we use the fetcher logic or assuming cache
        // Actually, we should probably just use the `useList` hook logic if possible,
        // but `useQueries` expects a queryFn.
        // Let's assume the useList `queryFn` is exportable or we reconstruct it.
        // Reconstructing:
        const endpoint = `/lists/${id}`;
        const response = await fetch('/api/v1' + endpoint).then((r) =>
          r.json()
        );
        return response.data;
      },
    })),
  });

  // 3. Aggregate Data
  const stats = useMemo(() => {
    let totalSpent = 0;
    let totalBudget = 0;
    const categorySpend = new Map<
      string,
      { name: string; spent: number; color?: string; icon?: string }
    >();
    let trips = 0;

    listDetailsQueries.forEach((query) => {
      const list = query.data;
      if (!list) return;

      trips++;
      totalBudget += Number(list.budget || 0);

      // Sum items
      list.items?.forEach(
        (item: {
          actualPrice?: number | string;
          estimatedPrice?: number | string;
          quantity: number | string;
          category?: {
            id: string;
            name: string;
            color?: string;
            icon?: string;
          };
        }) => {
          const cost =
            Number(item.actualPrice || item.estimatedPrice || 0) *
            Number(item.quantity);
          totalSpent += cost;

          if (item.category) {
            const catId = item.category.id;
            const current = categorySpend.get(catId) || {
              name: item.category.name,
              spent: 0,
              color: item.category.color,
              icon: item.category.icon,
            };
            current.spent += cost;
            categorySpend.set(catId, current);
          } else {
            const current = categorySpend.get('uncategorized') || {
              name: 'Uncategorized',
              spent: 0,
            };
            current.spent += cost;
            categorySpend.set('uncategorized', current);
          }
        }
      );
    });

    return {
      totalSpent,
      totalBudget,
      trips,
      categories: Array.from(categorySpend.values()).sort(
        (a, b) => b.spent - a.spent
      ),
    };
  }, [listDetailsQueries]);

  const budgetProgress =
    stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;

  return (
    <AppShell>
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Budget</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoriesModal(true)}
            >
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Categories</span>
            </Button>
            <CustomSelect
              options={DATE_RANGES.map((r) => ({ value: r, label: r }))}
              value={dateRange}
              // @ts-ignore
              onChange={(val) => setDateRange(val)}
              className="w-36"
            />
          </div>
        </div>

        {/* Spending Summary Card */}
        <Card className="mb-6 p-5">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Total Spent ({dateRange})
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">
                {currencySymbol}
                {stats.totalSpent.toFixed(2)}
              </span>
              {stats.totalBudget > 0 && (
                <span className="text-sm text-muted-foreground">
                  / {currencySymbol}
                  {stats.totalBudget.toFixed(2)} budget
                </span>
              )}
            </div>
          </div>

          {/* Budget Progress */}
          {stats.totalBudget > 0 && (
            <div className="mb-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    budgetProgress > 100 ? 'bg-destructive' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{budgetProgress.toFixed(0)}% used</span>
                <span>
                  {currencySymbol}
                  {(stats.totalBudget - stats.totalSpent).toFixed(2)} remaining
                </span>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-lg font-semibold">
                {currencySymbol}
                {stats.trips > 0
                  ? (stats.totalSpent / stats.trips).toFixed(0)
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">Avg per list</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{stats.trips}</p>
              <p className="text-xs text-muted-foreground">Lists Created</p>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              By Category
            </h2>
          </div>
          <div className="space-y-4">
            {stats.categories.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">
                No spending data for this period.
              </p>
            ) : (
              stats.categories.map((cat) => (
                <div key={cat.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon || '📦'}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="font-medium">
                      {currencySymbol}
                      {cat.spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        cat.color || 'bg-primary'
                      )}
                      style={{
                        width: `${stats.totalSpent > 0 ? (cat.spent / stats.totalSpent) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Container>

      <ManageCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
      />
    </AppShell>
  );
}
