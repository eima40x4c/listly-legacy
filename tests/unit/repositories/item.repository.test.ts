/**
 * Item Repository Unit Tests
 *
 * Tests for ItemRepository methods using mocked Prisma client.
 */

import type { ListItem, Prisma, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ItemRepository } from '@/repositories/item.repository';

// Mock Prisma client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrismaClient: any = {
  listItem: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: vi.fn((callback: (_client: any) => any) =>
    callback(mockPrismaClient)
  ),
};

describe('ItemRepository', () => {
  let repository: ItemRepository;
  let mockItem: ListItem;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new ItemRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    mockItem = {
      id: 'item-123',
      name: 'Milk',
      quantity: new Decimal(2),
      unit: 'gallon',
      notes: null,
      estimatedPrice: null,
      priority: 0,
      sortOrder: 0,
      isChecked: false,
      checkedAt: null,
      listId: 'list-123',
      addedById: 'user-123',
      categoryId: 'cat-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new item', async () => {
      mockPrismaClient.listItem.create.mockResolvedValue(mockItem);

      const input: Prisma.ListItemCreateInput = {
        name: 'Milk',
        quantity: 2,
        list: { connect: { id: 'list-123' } },
        addedBy: { connect: { id: 'user-123' } },
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.listItem.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockItem);
    });
  });

  describe('findById', () => {
    it('should find an item by ID', async () => {
      mockPrismaClient.listItem.findUnique.mockResolvedValue(mockItem);

      const result = await repository.findById('item-123');

      expect(mockPrismaClient.listItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'item-123' },
      });
      expect(result).toEqual(mockItem);
    });

    it('should return null when item not found', async () => {
      mockPrismaClient.listItem.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithDetails', () => {
    it('should find an item with related data', async () => {
      const itemWithDetails = {
        ...mockItem,
        category: { id: 'cat-123', name: 'Dairy', slug: 'dairy' },
        addedBy: { id: 'user-123', name: 'John', email: 'john@test.com' },
        list: { id: 'list-123', name: 'Grocery List' },
      };
      mockPrismaClient.listItem.findUnique.mockResolvedValue(itemWithDetails);

      const result = await repository.findByIdWithDetails('item-123');

      expect(mockPrismaClient.listItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'item-123' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          addedBy: { select: { id: true, name: true, email: true } },
          list: { select: { id: true, name: true } },
        },
      });
      expect(result).toEqual(itemWithDetails);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const updatedItem = { ...mockItem, name: 'Updated Milk' };
      mockPrismaClient.listItem.update.mockResolvedValue(updatedItem);

      const result = await repository.update('item-123', {
        name: 'Updated Milk',
      });

      expect(mockPrismaClient.listItem.update).toHaveBeenCalledWith({
        where: { id: 'item-123' },
        data: { name: 'Updated Milk' },
      });
      expect(result).toEqual(updatedItem);
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      mockPrismaClient.listItem.delete.mockResolvedValue(mockItem);

      await repository.delete('item-123');

      expect(mockPrismaClient.listItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-123' },
      });
    });
  });

  describe('findByList', () => {
    it('should find items for a list', async () => {
      const items = [mockItem];
      mockPrismaClient.listItem.findMany.mockResolvedValue(items);

      const result = await repository.findByList('list-123');

      expect(mockPrismaClient.listItem.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-123' },
        skip: 0,
        take: 500,
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toEqual(items);
    });

    it('should find items with pagination', async () => {
      mockPrismaClient.listItem.findMany.mockResolvedValue([mockItem]);

      await repository.findByList('list-123', { skip: 10, take: 20 });

      expect(mockPrismaClient.listItem.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-123' },
        orderBy: { sortOrder: 'asc' },
        skip: 10,
        take: 20,
      });
    });
  });

  describe('countByList', () => {
    it('should count items in a list', async () => {
      mockPrismaClient.listItem.count.mockResolvedValue(10);

      const result = await repository.countByList('list-123');

      expect(mockPrismaClient.listItem.count).toHaveBeenCalledWith({
        where: { listId: 'list-123' },
      });
      expect(result).toBe(10);
    });
  });

  describe('countCheckedByList', () => {
    it('should count checked items in a list', async () => {
      mockPrismaClient.listItem.count.mockResolvedValue(5);

      const result = await repository.countCheckedByList('list-123');

      expect(mockPrismaClient.listItem.count).toHaveBeenCalledWith({
        where: { listId: 'list-123', isChecked: true },
      });
      expect(result).toBe(5);
    });
  });

  describe('getEstimatedTotalByList', () => {
    it('should calculate estimated total price', async () => {
      mockPrismaClient.listItem.aggregate.mockResolvedValue({
        _sum: { estimatedPrice: 100.5 },
      });

      const result = await repository.getEstimatedTotalByList('list-123');

      expect(mockPrismaClient.listItem.aggregate).toHaveBeenCalledWith({
        where: { listId: 'list-123' },
        _sum: { estimatedPrice: true },
      });
      expect(result).toBe(100.5);
    });

    it('should return 0 when no estimated prices', async () => {
      mockPrismaClient.listItem.aggregate.mockResolvedValue({
        _sum: { estimatedPrice: null },
      });

      const result = await repository.getEstimatedTotalByList('list-123');

      expect(result).toBe(0);
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple items', async () => {
      mockPrismaClient.listItem.updateMany.mockResolvedValue({ count: 3 });

      const ids = ['item-1', 'item-2', 'item-3'];
      const result = await repository.bulkUpdate(ids, { isChecked: true });

      expect(mockPrismaClient.listItem.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: { isChecked: true },
      });
      expect(result).toBe(3);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple items', async () => {
      mockPrismaClient.listItem.deleteMany.mockResolvedValue({ count: 3 });

      const ids = ['item-1', 'item-2', 'item-3'];
      const result = await repository.bulkDelete(ids);

      expect(mockPrismaClient.listItem.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
      expect(result).toBe(3);
    });
  });

  describe('updatePositions', () => {
    it('should update sort order of multiple items', async () => {
      const updates = [
        { id: 'item-1', sortOrder: 0 },
        { id: 'item-2', sortOrder: 1 },
        { id: 'item-3', sortOrder: 2 },
      ];

      mockPrismaClient.listItem.update.mockResolvedValue(mockItem);

      await repository.updatePositions(updates);

      expect(mockPrismaClient.listItem.update).toHaveBeenCalledTimes(3);
      expect(mockPrismaClient.listItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { sortOrder: 0 },
      });
    });
  });

  describe('toggleChecked', () => {
    it('should toggle checked status to true', async () => {
      mockPrismaClient.listItem.findUnique.mockResolvedValue(mockItem);
      mockPrismaClient.listItem.update.mockResolvedValue({
        ...mockItem,
        isChecked: true,
      });

      const result = await repository.toggleChecked('item-123');

      expect(result.isChecked).toBe(true);
    });

    it('should toggle checked status to false', async () => {
      mockPrismaClient.listItem.findUnique.mockResolvedValue({
        ...mockItem,
        isChecked: true,
      });
      mockPrismaClient.listItem.update.mockResolvedValue({
        ...mockItem,
        isChecked: false,
      });

      const result = await repository.toggleChecked('item-123');

      expect(result.isChecked).toBe(false);
    });
  });
});
