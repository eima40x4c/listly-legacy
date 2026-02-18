/**
 * Settings Store
 *
 * Persisted user preferences using Zustand with localStorage.
 * Manages currency, notification preferences, view modes, haptic feedback,
 * and onboarding state.
 *
 * @module stores/useSettingsStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'grid' | 'list';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'EGP';

interface SettingsState {
  /** Default currency for budget/price displays */
  currency: Currency;
  /** Preferred view mode for recipe collections */
  viewMode: ViewMode;
  /** Whether push notifications are enabled */
  notificationsEnabled: boolean;
  /** Whether location services are enabled */
  locationEnabled: boolean;
  /** Default store name */
  defaultStore: string;
  /** Whether haptic feedback is enabled (mobile) */
  hapticEnabled: boolean;
  /** List of user IDs who have completed onboarding */
  onboardingCompletedUserIds: string[];

  // Actions
  setCurrency: (_currency: Currency) => void;
  setViewMode: (_mode: ViewMode) => void;
  setNotificationsEnabled: (_enabled: boolean) => void;
  setLocationEnabled: (_enabled: boolean) => void;
  setDefaultStore: (_store: string) => void;
  setHapticEnabled: (_enabled: boolean) => void;
  /** Mark onboarding as completed for a specific user ID */
  completeOnboarding: (_userId: string) => void;
  /** Reset onboarding for a specific user ID (debug/testing) */
  resetOnboarding: (_userId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      viewMode: 'grid',
      notificationsEnabled: true,
      locationEnabled: false,
      defaultStore: '',
      hapticEnabled: true,
      onboardingCompletedUserIds: [],

      setCurrency: (_currency) => set({ currency: _currency }),
      setViewMode: (_mode) => set({ viewMode: _mode }),
      setNotificationsEnabled: (_enabled) =>
        set({ notificationsEnabled: _enabled }),
      setLocationEnabled: (_enabled) => set({ locationEnabled: _enabled }),
      setDefaultStore: (_store) => set({ defaultStore: _store }),
      setHapticEnabled: (_enabled) => set({ hapticEnabled: _enabled }),
      completeOnboarding: (_userId) =>
        set((state) => ({
          onboardingCompletedUserIds: [
            ...state.onboardingCompletedUserIds,
            _userId,
          ],
        })),
      resetOnboarding: (_userId) =>
        set((state) => ({
          onboardingCompletedUserIds: state.onboardingCompletedUserIds.filter(
            (id) => id !== _userId
          ),
        })),
    }),
    {
      name: 'listly-settings',
    }
  )
);
