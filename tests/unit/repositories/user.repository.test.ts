/**
 * User Repository Unit Tests
 */

import type { Prisma, PrismaClient, User } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserRepository } from '@/repositories/user.repository';

const mockPrismaClient = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  shoppingList: {
    count: vi.fn(),
  },
  listItem: {
    count: vi.fn(),
  },
  listCollaborator: {
    count: vi.fn(),
  },
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new UserRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@test.com',
      emailVerified: false,
      passwordHash: 'hashed',
      avatarUrl: null,
      provider: 'EMAIL',
      providerId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockPrismaClient.user.create.mockResolvedValue(mockUser);

      const input: Prisma.UserCreateInput = {
        name: 'John Doe',
        email: 'john@test.com',
        passwordHash: 'hashed',
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('user-123');

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByIdWithPreferences', () => {
    it('should find user with preferences', async () => {
      const userWithPrefs = {
        ...mockUser,
        preferences: {
          id: 'pref-1',
          defaultBudgetWarning: 100,
          defaultCurrency: 'USD',
          notificationsEnabled: true,
          locationReminders: false,
          theme: 'light',
        },
      };
      mockPrismaClient.user.findUnique.mockResolvedValue(userWithPrefs);

      const result = await repository.findByIdWithPreferences('user-123');

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          preferences: true,
        },
      });
      expect(result).toEqual(userWithPrefs);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('john@test.com');

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@test.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Jane Doe' };
      mockPrismaClient.user.update.mockResolvedValue(updatedUser);

      const result = await repository.update('user-123', { name: 'Jane Doe' });

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'Jane Doe' },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockPrismaClient.user.delete.mockResolvedValue(mockUser);

      await repository.delete('user-123');

      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });
  });

  describe('getStats', () => {
    it('should get user statistics', async () => {
      mockPrismaClient.shoppingList.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);
      mockPrismaClient.listItem.count.mockResolvedValue(50);
      mockPrismaClient.listCollaborator.count.mockResolvedValue(5);

      const result = await repository.getStats('user-123');

      expect(result).toEqual({
        listCount: 10,
        itemCount: 50,
        collaborationCount: 5,
      });
    });
  });

  describe('searchByEmail', () => {
    it('should search users by email with default limit', async () => {
      const users = [
        {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@test.com',
          avatarUrl: null,
        },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(users);

      const result = await repository.searchByEmail('john');

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {
          email: {
            contains: 'john',
            mode: 'insensitive',
          },
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
        take: 10,
      });
      expect(result).toEqual(users);
    });

    it('should search users by email with custom limit', async () => {
      const users = [
        {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@test.com',
          avatarUrl: null,
        },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(users);

      const result = await repository.searchByEmail('john', 5);

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {
          email: {
            contains: 'john',
            mode: 'insensitive',
          },
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
        take: 5,
      });
      expect(result).toEqual(users);
    });

    it('should return empty array when no matches found', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([]);

      const result = await repository.searchByEmail('nonexistent@test.com');

      expect(result).toEqual([]);
    });

    it('should only return active users', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([]);

      await repository.searchByEmail('test');

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });
  });
});
