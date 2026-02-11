/**
 * Category Repository Unit Tests
 */

import type { Category, Prisma, PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryRepository } from '@/repositories/category.repository';

const mockPrismaClient = {
  category: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let mockCategory: Category;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new CategoryRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    mockCategory = {
      id: 'cat-123',
      name: 'Dairy',
      slug: 'dairy',
      description: null,
      icon: '🥛',
      color: '#FFE0B2',
      isDefault: true,
      sortOrder: 1,
      createdAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new category', async () => {
      mockPrismaClient.category.create.mockResolvedValue(mockCategory);

      const input: Prisma.CategoryCreateInput = {
        name: 'Dairy',
        slug: 'dairy',
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.category.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findById', () => {
    it('should find a category by ID', async () => {
      mockPrismaClient.category.findUnique.mockResolvedValue(mockCategory);

      const result = await repository.findById('cat-123');

      expect(mockPrismaClient.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-123' },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findBySlug', () => {
    it('should find a category by slug', async () => {
      mockPrismaClient.category.findUnique.mockResolvedValue(mockCategory);

      const result = await repository.findBySlug('dairy');

      expect(mockPrismaClient.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'dairy' },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findDefaults', () => {
    it('should find all default categories', async () => {
      const categories = [mockCategory];
      mockPrismaClient.category.findMany.mockResolvedValue(categories);

      const result = await repository.findDefaults();

      expect(mockPrismaClient.category.findMany).toHaveBeenCalledWith({
        where: { isDefault: true },
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toEqual(categories);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updatedCategory = { ...mockCategory, name: 'Updated Dairy' };
      mockPrismaClient.category.update.mockResolvedValue(updatedCategory);

      const result = await repository.update('cat-123', {
        name: 'Updated Dairy',
      });

      expect(mockPrismaClient.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-123' },
        data: { name: 'Updated Dairy' },
      });
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      mockPrismaClient.category.delete.mockResolvedValue(mockCategory);

      await repository.delete('cat-123');

      expect(mockPrismaClient.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-123' },
      });
    });
  });

  describe('search', () => {
    it('should search categories by name with default limit', async () => {
      const categories = [mockCategory];
      mockPrismaClient.category.findMany.mockResolvedValue(categories);

      const result = await repository.search('dairy');

      expect(mockPrismaClient.category.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'dairy',
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
        take: 10,
      });
      expect(result).toEqual(categories);
    });

    it('should search categories by name with custom limit', async () => {
      const categories = [mockCategory];
      mockPrismaClient.category.findMany.mockResolvedValue(categories);

      const result = await repository.search('dairy', 5);

      expect(mockPrismaClient.category.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'dairy',
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
        take: 5,
      });
      expect(result).toEqual(categories);
    });

    it('should return empty array when no matches found', async () => {
      mockPrismaClient.category.findMany.mockResolvedValue([]);

      const result = await repository.search('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
