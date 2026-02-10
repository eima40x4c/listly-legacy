import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  provider: 'EMAIL' | 'GOOGLE' | 'APPLE';
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  defaultBudgetWarning?: number;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  locationReminders: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface UserWithPreferences extends User {
  preferences: UserPreferences;
}

interface UserResponse {
  success: true;
  data: User;
}

interface UserWithPreferencesResponse {
  success: true;
  data: UserWithPreferences;
}

interface PreferencesResponse {
  success: true;
  data: UserPreferences;
}

interface UpdateUserData {
  name?: string;
  avatarUrl?: string;
}

interface UpdatePreferencesData {
  defaultBudgetWarning?: number;
  defaultCurrency?: string;
  notificationsEnabled?: boolean;
  locationReminders?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

// Query keys factory
export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
};

// Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => api.get<UserWithPreferencesResponse>('/users/me'),
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: userKeys.preferences(),
    queryFn: () => api.get<PreferencesResponse>('/users/me/preferences'),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserData) =>
      api.patch<UserResponse>('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesData) =>
      api.patch<PreferencesResponse>('/users/me/preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete('/users/me'),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
