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
import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
// import Apple from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';

/**
 * Custom Prisma adapter that maps NextAuth's user fields to our schema.
 * Maps `image` -> `avatarUrl` and handles `emailVerified` as boolean.
 */
function customPrismaAdapter(): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,
    async createUser(user) {
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
    async getUser(id) {
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
    async getUserByEmail(email) {
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
    async getUserByAccount({ providerAccountId, provider }) {
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
    async updateUser({ id, ...data }) {
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
  };
}

/**
 * NextAuth configuration options.
 *
 * Features:
 * - Google OAuth (primary)
 * - Apple OAuth (primary)
 * - Credentials-based authentication (email/password fallback)
 * - Custom Prisma adapter for database persistence
 * - Database session strategy for OAuth
 * - Custom callbacks to sync OAuth users with our schema
 */
export const authConfig: NextAuthConfig = {
  adapter: customPrismaAdapter() as any, // Type compatibility workaround for NextAuth v5 beta

  providers: [
    // ── Primary: OAuth Providers ──────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // Apple OAuth - Disabled for now
    // Apple({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    //   allowDangerousEmailAccountLinking: true,
    // }),

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

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account is disabled');
        }

        // OAuth-only users cannot use credentials login
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

        // Return user object (will be encoded in JWT)
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

  session: {
    strategy: 'jwt', // JWT sessions work in Edge runtime (middleware)
    maxAge: 24 * 60 * 60, // 24 hours (matches NFR: "JWT with 24h expiry")
    updateAge: 60 * 60, // 1 hour (refresh session hourly within the 24h window)
  },

  callbacks: {
    /**
     * JWT callback - runs when JWT is created or updated.
     * Add custom claims to the token here.
     */
    async jwt({ token, user, trigger }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id!;
        token.emailVerified = !!user.emailVerified;
      }

      // Handle token refresh/update
      if (trigger === 'update') {
        // Fetch fresh user data
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            emailVerified: true,
            isActive: true,
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

    /**
     * Session callback - runs when session is accessed.
     * Add custom fields to the session object here.
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified ? new Date() : null;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/auth/verify-request',
  },

  events: {
    /**
     * Sync OAuth provider info with our User model.
     * When a user signs in via Google/Apple for the first time,
     * the Prisma adapter creates the user but doesn't set our custom
     * `provider` and `providerId` fields. This event fills those in.
     */
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
              emailVerified: true, // OAuth emails are pre-verified
            },
          });
        }
      }
    },

    /**
     * Create default UserPreferences for new users.
     */
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

  // Enable debug logging in development
  debug: process.env.NODE_ENV === 'development',
};

/**
 * NextAuth handlers and helper functions.
 * Export auth, signIn, signOut for use in the app.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
