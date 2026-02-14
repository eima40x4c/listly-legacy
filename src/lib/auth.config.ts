/**
 * NextAuth.js Lightweight Configuration
 *
 * Edge-compatible configuration for middleware.
 * Contains core settings that don't rely on database adapters or Node.js logic.
 *
 * @module lib/auth.config
 */

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/auth/verify-request',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  providers: [], // Providers are configured in auth.ts

  callbacks: {
    /**
     * Session callback - safe for edge (uses token only)
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified ? new Date() : null;
      }
      return session;
    },

    /**
     * JWT callback - basic logic safe for edge
     * Full database synchronization happens in auth.ts
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.emailVerified = !!user.emailVerified;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
