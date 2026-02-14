/**
 * NextAuth.js Configuration
 *
 * Configures authentication with OAuth providers (Google, Apple) as the primary
 * login method and email/password credentials as a fallback.
 * Uses Prisma adapter for database persistence.
 *
 * @module lib/auth
 */

/**
 * NextAuth.js Configuration
 *
 * Configures authentication with OAuth providers (Google, Apple) as the primary
 * login method and email/password credentials as a fallback.
 * Uses Prisma adapter for database persistence.
 *
 * @module lib/auth
 */

import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { authConfig } from '@/lib/auth.config';
import { verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';

/**
 * Custom Prisma adapter that maps NextAuth's user fields to our schema.
 * Maps `image` -> `avatarUrl` and handles `emailVerified` as boolean.
 */
function customPrismaAdapter(): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  // Cast to any first to bypass @auth/core version mismatch between
  // @auth/prisma-adapter (0.41.1) and next-auth (0.41.0)
  return {
    ...baseAdapter,
    async createUser(user: any) {
      const data = {
        id: user.id,
        name: user.name || '',
        email: user.email,
        avatarUrl: user.image || null,
        emailVerified: !!user.emailVerified,
      };

      const createdUser = await prisma.user.create({
        data,
      });

      return {
        ...createdUser,
        image: createdUser.avatarUrl,
        emailVerified: createdUser.emailVerified ? new Date() : null,
      };
    },
    async getUser(id: string) {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) return null;

      return {
        ...user,
        image: user.avatarUrl,
        emailVerified: user.emailVerified ? new Date() : null,
      };
    },
    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) return null;

      return {
        ...user,
        image: user.avatarUrl,
        emailVerified: user.emailVerified ? new Date() : null,
      };
    },
    async getUserByAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });

      if (!account) return null;

      return {
        ...account.user,
        image: account.user.avatarUrl,
        emailVerified: account.user.emailVerified ? new Date() : null,
      };
    },
    async updateUser({ id, ...data }: { id: string; [key: string]: any }) {
      const updateData: any = { ...data };

      if ('image' in updateData) {
        updateData.avatarUrl = updateData.image;
        delete updateData.image;
      }

      if ('emailVerified' in updateData) {
        updateData.emailVerified = !!updateData.emailVerified;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return {
        ...user,
        image: user.avatarUrl,
        emailVerified: user.emailVerified ? new Date() : null,
      };
    },
  } as any as Adapter;
}

/**
 * NextAuth handlers and helper functions.
 * Export auth, signIn, signOut for use in the app.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: customPrismaAdapter() as any,

  providers: [
    // ── Primary: OAuth Providers ──────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // ── Fallback: Email/Password ─────────────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account is disabled');
        }

        if (!user.passwordHash) {
          throw new Error(
            'This account uses social login. Please sign in with Google or Apple.'
          );
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          emailVerified: user.emailVerified ? new Date() : null,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // Basic logic from config
      await authConfig.callbacks?.jwt?.({
        token,
        user,
        trigger,
        session: null,
      } as any);

      // Database sync for updates
      if (trigger === 'update') {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            email: true,
            name: true,
            avatarUrl: true,
            emailVerified: true,
          },
        });

        if (updatedUser) {
          token.email = updatedUser.email;
          token.name = updatedUser.name;
          token.picture = updatedUser.avatarUrl;
          token.emailVerified = updatedUser.emailVerified;
        }
      }

      return token;
    },
  },

  events: {
    async signIn({ user, account }) {
      if (account && user?.id && account.provider !== 'credentials') {
        const providerMap: Record<string, string> = {
          google: 'GOOGLE',
          apple: 'APPLE',
        };
        const provider = providerMap[account.provider];

        if (provider) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: provider as any,
              providerId: account.providerAccountId,
              emailVerified: true,
            },
          });
        }
      }
    },
    async createUser({ user }) {
      if (user?.id) {
        const existing = await prisma.userPreferences.findUnique({
          where: { userId: user.id },
        });
        if (!existing) {
          await prisma.userPreferences.create({
            data: {
              userId: user.id,
              defaultCurrency: 'USD',
              notificationsEnabled: true,
              locationReminders: false,
              theme: 'system',
            },
          });
        }
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
});
