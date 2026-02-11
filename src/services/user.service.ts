/**
 * User Service Implementation
 *
 * Business logic for user profile management.
 * Handles user CRUD, preferences, and profile updates.
 *
 * @module services/user.service
 */

import type { User, UserPreferences } from '@prisma/client';

import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors/AppError';
import { UserRepository } from '@/repositories';

import type {
  IUpdatePreferencesInput,
  IUpdateUserInput,
  IUserService,
  IUserStats,
  IUserWithPreferences,
} from './interfaces';

export class UserService implements IUserService {
  readonly serviceName = 'UserService';

  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<IUserWithPreferences | null> {
    const user = await this.userRepo.findByIdWithPreferences(id);
    return user as IUserWithPreferences | null;
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, data: IUpdateUserInput): Promise<User> {
    const user = await this.getById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.userRepo.update(id, data);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    data: IUpdatePreferencesInput
  ): Promise<UserPreferences> {
    // Check if preferences exist
    const existing = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (existing) {
      return prisma.userPreferences.update({
        where: { userId },
        data,
      });
    }

    // Create if not exists
    return prisma.userPreferences.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    return prisma.userPreferences.findUnique({
      where: { userId },
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Cascade delete will handle related records
    await this.userRepo.delete(userId);
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string): Promise<IUserStats> {
    const [listCount, itemCount, collaborationCount, completedListsCount] =
      await Promise.all([
        prisma.shoppingList.count({
          where: { ownerId: userId },
        }),
        prisma.listItem.count({
          where: {
            list: {
              OR: [
                { ownerId: userId },
                { collaborators: { some: { userId } } },
              ],
            },
          },
        }),
        prisma.listCollaborator.count({
          where: { userId },
        }),
        prisma.shoppingList.count({
          where: { ownerId: userId, status: 'COMPLETED' },
        }),
      ]);

    return {
      listCount,
      itemCount,
      collaborationCount,
      completedListsCount,
    };
  }

  /**
   * Search users by email
   */
  async searchByEmail(
    query: string,
    limit = 10
  ): Promise<Array<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>>> {
    return this.userRepo.searchByEmail(query, limit);
  }

  /**
   * Check if user exists
   */
  async exists(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);
    return !!user;
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    return this.userRepo.update(userId, { emailVerified: true });
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    return this.updateProfile(userId, { avatarUrl });
  }
}
