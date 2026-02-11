/**
 * Store Repository Unit Tests
 */

import type { Prisma, PrismaClient, Store } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StoreRepository } from '@/repositories/store.repository';

const mockPrismaClient = {
  store: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('StoreRepository', () => {
  let repository: StoreRepository;
  let mockStore: Store;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new StoreRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    mockStore = {
      id: 'store-123',
      name: 'Walmart Supercenter',
      chain: 'Walmart',
      address: '123 Main St',
      latitude: null,
      longitude: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new store', async () => {
      mockPrismaClient.store.create.mockResolvedValue(mockStore);

      const input: Prisma.StoreCreateInput = {
        name: 'Walmart Supercenter',
        chain: 'Walmart',
        address: '123 Main St',
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.store.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockStore);
    });
  });

  describe('findById', () => {
    it('should find a store by ID', async () => {
      mockPrismaClient.store.findUnique.mockResolvedValue(mockStore);

      const result = await repository.findById('store-123');

      expect(mockPrismaClient.store.findUnique).toHaveBeenCalledWith({
        where: { id: 'store-123' },
      });
      expect(result).toEqual(mockStore);
    });
  });

  describe('findByChain', () => {
    it('should find stores by chain', async () => {
      const stores = [mockStore];
      mockPrismaClient.store.findMany.mockResolvedValue(stores);

      const result = await repository.findByChain('Walmart');

      expect(mockPrismaClient.store.findMany).toHaveBeenCalledWith({
        where: { chain: 'Walmart' },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(stores);
    });
  });

  describe('search', () => {
    it('should search stores by name or chain', async () => {
      const stores = [mockStore];
      mockPrismaClient.store.findMany.mockResolvedValue(stores);

      const result = await repository.search('walmart', { take: 10 });

      expect(mockPrismaClient.store.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'walmart', mode: 'insensitive' } },
            { chain: { contains: 'walmart', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(stores);
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const updatedStore = { ...mockStore, name: 'Updated Store' };
      mockPrismaClient.store.update.mockResolvedValue(updatedStore);

      const result = await repository.update('store-123', {
        name: 'Updated Store',
      });

      expect(mockPrismaClient.store.update).toHaveBeenCalledWith({
        where: { id: 'store-123' },
        data: { name: 'Updated Store' },
      });
      expect(result).toEqual(updatedStore);
    });
  });

  describe('delete', () => {
    it('should delete a store', async () => {
      mockPrismaClient.store.delete.mockResolvedValue(mockStore);

      await repository.delete('store-123');

      expect(mockPrismaClient.store.delete).toHaveBeenCalledWith({
        where: { id: 'store-123' },
      });
    });
  });
});
