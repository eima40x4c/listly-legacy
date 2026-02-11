/**
 * List Repository Unit Tests
 *
 * Tests for ListRepository methods using mocked Prisma client.
 */

import type { Prisma, PrismaClient, ShoppingList } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ListRepository } from '@/repositories/list.repository';

// Mock Prisma client
const mockPrismaClient = {
  shoppingList: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  listCollaborator: {
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  listItem: {
    count: vi.fn(),
  },
};

describe('ListRepository', () => {
  let repository: ListRepository;
  let mockList: ShoppingList;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create repository instance with mocked Prisma
    repository = new ListRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    // Mock data
    mockList = {
      id: 'list-123',
      name: 'Grocery List',
      description: 'Weekly groceries',
      budget: null,
      status: 'ACTIVE',
      isTemplate: false,
      color: '#FF5733',
      icon: '🛒',
      ownerId: 'user-123',
      storeId: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new list', async () => {
      mockPrismaClient.shoppingList.create.mockResolvedValue(mockList);

      const input: Prisma.ShoppingListCreateInput = {
        name: 'Grocery List',
        owner: { connect: { id: 'user-123' } },
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.shoppingList.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockList);
    });
  });

  describe('findById', () => {
    it('should find a list by ID', async () => {
      mockPrismaClient.shoppingList.findUnique.mockResolvedValue(mockList);

      const result = await repository.findById('list-123');

      expect(mockPrismaClient.shoppingList.findUnique).toHaveBeenCalledWith({
        where: { id: 'list-123' },
      });
      expect(result).toEqual(mockList);
    });

    it('should return null when list not found', async () => {
      mockPrismaClient.shoppingList.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByOwner', () => {
    it('should find all lists owned by user', async () => {
      const lists = [mockList];
      mockPrismaClient.shoppingList.findMany.mockResolvedValue(lists);

      const result = await repository.findByOwner('user-123');

      expect(mockPrismaClient.shoppingList.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
        skip: 0,
        take: 50,
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(lists);
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      const updatedList = { ...mockList, name: 'Updated List' };
      mockPrismaClient.shoppingList.update.mockResolvedValue(updatedList);

      const result = await repository.update('list-123', {
        name: 'Updated List',
      });

      expect(mockPrismaClient.shoppingList.update).toHaveBeenCalledWith({
        where: { id: 'list-123' },
        data: { name: 'Updated List' },
      });
      expect(result).toEqual(updatedList);
    });
  });

  describe('delete', () => {
    it('should delete a list', async () => {
      mockPrismaClient.shoppingList.delete.mockResolvedValue(mockList);

      await repository.delete('list-123');

      expect(mockPrismaClient.shoppingList.delete).toHaveBeenCalledWith({
        where: { id: 'list-123' },
      });
    });
  });

  describe('hasAccess', () => {
    it('should return true when user is owner', async () => {
      mockPrismaClient.shoppingList.findUnique.mockResolvedValue(mockList);

      const result = await repository.hasAccess('list-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return true when user is collaborator', async () => {
      mockPrismaClient.shoppingList.findUnique.mockResolvedValue({
        ...mockList,
        ownerId: 'other-user',
      });
      mockPrismaClient.listCollaborator.findFirst.mockResolvedValue({
        id: 'collab-1',
        listId: 'list-123',
        userId: 'user-123',
      });

      const result = await repository.hasAccess('list-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return false when user has no access', async () => {
      mockPrismaClient.shoppingList.findFirst.mockResolvedValue(null);

      const result = await repository.hasAccess('list-123', 'user-123');

      expect(result).toBe(false);
    });

    it('should return false when list does not exist', async () => {
      mockPrismaClient.shoppingList.findFirst.mockResolvedValue(null);

      const result = await repository.hasAccess('nonexistent', 'user-123');

      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true when user is owner', async () => {
      mockPrismaClient.shoppingList.findFirst.mockResolvedValue(mockList);

      const result = await repository.isOwner('list-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return false when user is not owner', async () => {
      mockPrismaClient.shoppingList.findFirst.mockResolvedValue(null);

      const result = await repository.isOwner('list-123', 'other-user');

      expect(result).toBe(false);
    });

    it('should return false when list does not exist', async () => {
      mockPrismaClient.shoppingList.findFirst.mockResolvedValue(null);

      const result = await repository.isOwner('nonexistent', 'user-123');

      expect(result).toBe(false);
    });
  });

  describe('countByOwner', () => {
    it('should count lists owned by user', async () => {
      mockPrismaClient.shoppingList.count.mockResolvedValue(5);

      const result = await repository.countByOwner('user-123');

      expect(mockPrismaClient.shoppingList.count).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
      });
      expect(result).toBe(5);
    });
  });
});
