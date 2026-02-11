/**
 * Store Service Implementation
 *
 * Business logic for store management.
 * Handles store CRUD, user favorites, and location-based queries.
 *
 * @module services/store.service
 */

import type { Prisma, Store, UserFavoriteStore } from '@prisma/client';

import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors/AppError';
import { StoreRepository } from '@/repositories';

import type {
  ICreateStoreInput,
  IPaginatedResponse,
  IStoreFilters,
  IStoreService,
  IStoreWithDistance,
  IStoreWithFavorite,
  IUpdateStoreInput,
} from './interfaces';

export class StoreService implements IStoreService {
  readonly serviceName = 'StoreService';

  private storeRepo: StoreRepository;

  constructor() {
    this.storeRepo = new StoreRepository();
  }

  /**
   * Get all stores with pagination and filters
   */
  async getAll(filters?: IStoreFilters): Promise<IPaginatedResponse<Store>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {};

    if (filters?.chain) {
      where.chain = filters.chain;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { chain: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.store.count({ where }),
    ]);

    return {
      data: stores,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get store by ID
   */
  async getById(id: string): Promise<Store | null> {
    return this.storeRepo.findById(id);
  }

  /**
   * Search stores
   */
  async search(query: string, limit = 10): Promise<Store[]> {
    return this.storeRepo.search(query, { take: limit });
  }

  /**
   * Find nearby stores (requires geolocation)
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm = 10
  ): Promise<IStoreWithDistance[]> {
    // Get all stores with coordinates
    const stores = await prisma.store.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // Calculate distance using Haversine formula
    const storesWithDistance = stores
      .map((store) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          Number(store.latitude),
          Number(store.longitude)
        );

        return {
          ...store,
          distance,
        };
      })
      .filter((store) => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return storesWithDistance;
  }

  /**
   * Create a new store
   */
  async create(input: ICreateStoreInput): Promise<Store> {
    return this.storeRepo.create(input);
  }

  /**
   * Update a store
   */
  async update(id: string, data: IUpdateStoreInput): Promise<Store> {
    const store = await this.getById(id);
    if (!store) {
      throw new NotFoundError('Store not found');
    }

    return this.storeRepo.update(id, data);
  }

  /**
   * Delete a store
   */
  async delete(id: string): Promise<void> {
    const store = await this.getById(id);
    if (!store) {
      throw new NotFoundError('Store not found');
    }

    await this.storeRepo.delete(id);
  }

  /**
   * Add store to favorites
   */
  async addFavorite(
    userId: string,
    storeId: string
  ): Promise<UserFavoriteStore> {
    // Check if already favorited
    const existing = await prisma.userFavoriteStore.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.userFavoriteStore.create({
      data: {
        userId,
        storeId,
      },
    });
  }

  /**
   * Remove store from favorites
   */
  async removeFavorite(userId: string, storeId: string): Promise<void> {
    await prisma.userFavoriteStore.delete({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });
  }

  /**
   * Get user's favorite stores
   */
  async getFavorites(userId: string): Promise<IStoreWithFavorite[]> {
    const favorites = await prisma.userFavoriteStore.findMany({
      where: { userId },
      include: {
        store: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return favorites.map((fav) => ({
      ...fav.store,
      isFavorite: true,
    }));
  }

  /**
   * Reorder favorites
   */
  async reorderFavorites(userId: string, storeIds: string[]): Promise<void> {
    // Without a sortOrder field, we'll need to delete and re-add favorites in order
    // This maintains the order via createdAt timestamps
    await prisma.$transaction(async (tx) => {
      // Delete all current favorites
      await tx.userFavoriteStore.deleteMany({
        where: { userId },
      });

      // Re-add in new order
      for (const storeId of storeIds) {
        await tx.userFavoriteStore.create({
          data: { userId, storeId },
        });
      }
    });
  }

  /**
   * Check if store is favorited
   */
  async isFavorite(userId: string, storeId: string): Promise<boolean> {
    const favorite = await prisma.userFavoriteStore.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    return !!favorite;
  }

  /**
   * Get stores by chain
   */
  async getByChain(chain: string): Promise<Store[]> {
    return this.storeRepo.findByChain(chain);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
