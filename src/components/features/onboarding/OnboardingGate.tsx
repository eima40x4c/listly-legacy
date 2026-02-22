/**
 * OnboardingGate Component
 *
 * Client wrapper that shows the OnboardingFlow overlay on first login
 * if the user hasn't completed onboarding yet.
 * Reads `hasCompletedOnboarding` from the settings store (persisted in localStorage).
 *
 * @module components/features/onboarding/OnboardingGate
 */

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { useLists } from '@/hooks/api/useLists';
import { useSettingsStore } from '@/stores/useSettingsStore';

import { OnboardingFlow } from './OnboardingFlow';

export function OnboardingGate() {
  const { data: session } = useSession();
  const onboardingCompletedUserIds = useSettingsStore(
    (s) => s.onboardingCompletedUserIds
  );
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  // Check if user has lists to verify if they are actually a returning user
  // This handles the "legacy user" case where local storage might be clear
  const { data: lists } = useLists({}, { enabled: !!session?.user });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userId = session?.user?.id;
  const hasCompletedElement = userId
    ? onboardingCompletedUserIds.includes(userId)
    : false;

  // Auto-complete onboarding if user has lists
  useEffect(() => {
    if (userId && lists && lists.length > 0 && !hasCompletedElement) {
      completeOnboarding(userId);
    }
  }, [userId, lists, hasCompletedElement, completeOnboarding]);

  // Don't render until hydrated (avoids SSR mismatch with localStorage)
  if (!mounted) return null;

  // Already completed or not logged in → nothing to show
  if (!session?.user || hasCompletedElement) return null;

  // Determine if we should show it (wait for lists check if possible?)
  // If lists is loading, wait before showing onboarding
  // This prevents flash for existing users who already have lists
  const isLoadingLists = !lists && session?.user;

  if (isLoadingLists) return null;

  return (
    <OnboardingFlow userName={session.user.name} userId={session.user.id} />
  );
}
