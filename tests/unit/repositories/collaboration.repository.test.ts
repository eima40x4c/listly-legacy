/**
 * Collaboration Repository Unit Tests
 */

import type { ListCollaborator, Prisma, PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollaborationRepository } from '@/repositories/collaboration.repository';

const mockPrismaClient = {
  listCollaborator: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

describe('CollaborationRepository', () => {
  let repository: CollaborationRepository;
  let mockCollaborator: ListCollaborator;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new CollaborationRepository(
      mockPrismaClient as unknown as PrismaClient
    );

    mockCollaborator = {
      id: 'collab-123',
      listId: 'list-123',
      userId: 'user-456',
      role: 'EDITOR',
      joinedAt: new Date(),
    };
  });

  describe('create', () => {
    it('should create a new collaborator', async () => {
      mockPrismaClient.listCollaborator.create.mockResolvedValue(
        mockCollaborator
      );

      const input: Prisma.ListCollaboratorCreateInput = {
        list: { connect: { id: 'list-123' } },
        user: { connect: { id: 'user-456' } },
        role: 'EDITOR',
      };

      const result = await repository.create(input);

      expect(mockPrismaClient.listCollaborator.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockCollaborator);
    });
  });

  describe('findById', () => {
    it('should find a collaborator by ID', async () => {
      mockPrismaClient.listCollaborator.findUnique.mockResolvedValue(
        mockCollaborator
      );

      const result = await repository.findById('collab-123');

      expect(mockPrismaClient.listCollaborator.findUnique).toHaveBeenCalledWith(
        {
          where: { id: 'collab-123' },
        }
      );
      expect(result).toEqual(mockCollaborator);
    });
  });

  describe('findByListAndUser', () => {
    it('should find a specific collaboration', async () => {
      mockPrismaClient.listCollaborator.findUnique.mockResolvedValue(
        mockCollaborator
      );

      const result = await repository.findByListAndUser('list-123', 'user-456');

      expect(mockPrismaClient.listCollaborator.findUnique).toHaveBeenCalledWith(
        {
          where: {
            listId_userId: {
              listId: 'list-123',
              userId: 'user-456',
            },
          },
        }
      );
      expect(result).toEqual(mockCollaborator);
    });
  });

  describe('findByList', () => {
    it('should find all collaborators for a list', async () => {
      const collabWithUser = {
        ...mockCollaborator,
        user: {
          id: 'user-456',
          name: 'Jane Doe',
          email: 'jane@test.com',
          avatarUrl: null,
        },
      };
      mockPrismaClient.listCollaborator.findMany.mockResolvedValue([
        collabWithUser,
      ]);

      const result = await repository.findByList('list-123');

      expect(mockPrismaClient.listCollaborator.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-123' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      });
      expect(result).toEqual([collabWithUser]);
    });
  });

  describe('findByUser', () => {
    it('should find all lists a user collaborates on', async () => {
      const collabWithList = {
        ...mockCollaborator,
        list: {
          id: 'list-123',
          name: 'Grocery List',
          description: null,
          status: 'ACTIVE',
          owner: {
            id: 'user-123',
            name: 'John Doe',
          },
        },
      };
      mockPrismaClient.listCollaborator.findMany.mockResolvedValue([
        collabWithList,
      ]);

      const result = await repository.findByUser('user-456');

      expect(mockPrismaClient.listCollaborator.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-456' },
        include: {
          list: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });
      expect(result).toEqual([collabWithList]);
    });
  });

  describe('updateRole', () => {
    it('should update collaborator role', async () => {
      const updated = { ...mockCollaborator, role: 'ADMIN' as const };
      mockPrismaClient.listCollaborator.update.mockResolvedValue(updated);

      const result = await repository.updateRole('collab-123', 'ADMIN');

      expect(mockPrismaClient.listCollaborator.update).toHaveBeenCalledWith({
        where: { id: 'collab-123' },
        data: { role: 'ADMIN' },
      });
      expect(result.role).toBe('ADMIN');
    });
  });

  describe('delete', () => {
    it('should delete a collaborator', async () => {
      mockPrismaClient.listCollaborator.delete.mockResolvedValue(
        mockCollaborator
      );

      await repository.delete('collab-123');

      expect(mockPrismaClient.listCollaborator.delete).toHaveBeenCalledWith({
        where: { id: 'collab-123' },
      });
    });
  });

  describe('countByList', () => {
    it('should count collaborators on a list', async () => {
      mockPrismaClient.listCollaborator.count.mockResolvedValue(5);

      const result = await repository.countByList('list-123');

      expect(mockPrismaClient.listCollaborator.count).toHaveBeenCalledWith({
        where: { listId: 'list-123' },
      });
      expect(result).toBe(5);
    });
  });

  describe('isCollaborator', () => {
    it('should return true when user is collaborator', async () => {
      mockPrismaClient.listCollaborator.findUnique.mockResolvedValue(
        mockCollaborator
      );

      const result = await repository.isCollaborator('list-123', 'user-456');

      expect(result).toBe(true);
    });

    it('should return false when user is not collaborator', async () => {
      mockPrismaClient.listCollaborator.findUnique.mockResolvedValue(null);

      const result = await repository.isCollaborator('list-123', 'user-789');

      expect(result).toBe(false);
    });
  });

  describe('getRole', () => {
    it('should return user role on list', async () => {
      mockPrismaClient.listCollaborator.findUnique.mockResolvedValue(
        mockCollaborator
      );

      const result = await repository.getRole('list-123', 'user-456');

      expect(result).toBe('EDITOR');
    });

    it('should return null when not a collaborator', async () => {
      mockPrismaClient.listCollaborator.findUnique.mockResolvedValue(null);

      const result = await repository.getRole('list-123', 'user-789');

      expect(result).toBeNull();
    });
  });
});
