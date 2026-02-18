import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch from ItemHistory
    const historyItems = await prisma.itemHistory.groupBy({
      by: ['itemName', 'storeId'],
      where: {
        userId: session.user.id,
        action: { in: ['ADDED', 'CHECKED'] }, // Consider items added or checked
      },
      _count: {
        itemName: true,
      },
      _max: {
        createdAt: true,
      },
      orderBy: {
        _max: {
          createdAt: 'desc',
        },
      },
    });

    // 2. Format response
    // Note: We don't have direct category relation on ItemHistory anymore (it links to ListItem -> Category or just denormalized).
    // The schema shows ItemHistory has `itemId` (nullable) and `storeId`.
    // It does NOT have categoryId directly.
    // To get category, we might need to find the latest ListItem for this itemName or just return without category for now.
    // However, the UI expects a category for the icon.
    // A simple workaround: Try to find a recent ListItem with this name to get the category.

    // Let's get unique item names
    const itemNames = historyItems.map((i: any) => i.itemName);

    // Find latest list items with these names to get categories
    const latestListItems = await prisma.listItem.findMany({
      where: {
        name: { in: itemNames },
        addedById: session.user.id,
        categoryId: { not: null },
      },
      distinct: ['name'],
      select: {
        name: true,
        category: true,
      },
    });

    const categoryMap = new Map(
      latestListItems.map((i: any) => [i.name, i.category])
    );

    const historyCallback = historyItems.map((item: any) => ({
      name: item.itemName,
      category: categoryMap.get(item.itemName) || undefined,
      useCount: item._count.itemName,
      lastUsedAt: item._max.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: historyCallback,
    });
  } catch (error) {
    console.error('Failed to fetch item history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get item name from URL
    const url = new URL(req.url);
    const itemName = url.pathname.split('/').pop();

    if (!itemName) {
      return new NextResponse('Item name required', { status: 400 });
    }

    const decodedName = decodeURIComponent(itemName);

    // "Deleting" history:
    // We can delete all ItemHistory entries for this item and user.
    await prisma.itemHistory.deleteMany({
      where: {
        userId: session.user.id,
        itemName: decodedName,
      },
    });

    // Optionally, we could also flag ListItems as "hidden" if we had that field, but we don't.
    // Deleting ItemHistory should stop it from being "learned" if the learning logic relies on ItemHistory.
    // Current suggestions rely on `existingLists` (active/completed lists).
    // So simply deleting ItemHistory might NOT remove it from suggestions if the suggestion logic looks at `ShoppingList -> ListItem`.
    // The `CreateListModal` looks at `existingLists`.
    // To strictly "forget" an item, we might need to remove it from `ShoppingList` items too? No, that destroys data.
    // Ideally, suggestions should COME FROM ItemHistory, OR we filter out items that are on a "Ignore List".
    // Since we lack an "Ignore List", deleting ItemHistory is the best proxy "Forget" action we have,
    // PROVIDED we switch suggestions to use ItemHistory (or filter against it).

    // Use case: User wants to delete "Weird Item".
    // If we delete from ItemHistory, and suggestions come from `useLists` (active lists), it might still appear if it's in an active list.
    // But clearing it from history is a good start.
    // FUTURE: Update suggestions to prefer ItemHistory.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
