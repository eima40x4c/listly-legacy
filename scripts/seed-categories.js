/* eslint-disable no-console, no-undef */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  {
    name: 'Produce',
    slug: 'produce',
    icon: '🥦',
    color: '#22c55e',
    sortOrder: 10,
  },
  {
    name: 'Dairy & Cheese',
    slug: 'dairy',
    icon: '🧀',
    color: '#eab308',
    sortOrder: 20,
  },
  {
    name: 'Meat & Seafood',
    slug: 'meat',
    icon: '🥩',
    color: '#ef4444',
    sortOrder: 30,
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    icon: '🥖',
    color: '#f97316',
    sortOrder: 40,
  },
  {
    name: 'Pantry',
    slug: 'pantry',
    icon: '🥫',
    color: '#8b5cf6',
    sortOrder: 50,
  },
  {
    name: 'Frozen',
    slug: 'frozen',
    icon: '❄️',
    color: '#06b6d4',
    sortOrder: 60,
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    icon: '🥤',
    color: '#3b82f6',
    sortOrder: 70,
  },
  {
    name: 'Snacks',
    slug: 'snacks',
    icon: '🍿',
    color: '#ec4899',
    sortOrder: 80,
  },
  {
    name: 'Household',
    slug: 'household',
    icon: '🧹',
    color: '#64748b',
    sortOrder: 90,
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    icon: '🧴',
    color: '#d946ef',
    sortOrder: 100,
  },
  { name: 'Pets', slug: 'pets', icon: '🐾', color: '#a855f7', sortOrder: 110 },
  {
    name: 'Other',
    slug: 'other',
    icon: '📦',
    color: '#94a3b8',
    sortOrder: 999,
    isDefault: true,
  },
];

async function main() {
  console.log('Start seeding categories...');

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: cat,
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category exists: ${cat.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
