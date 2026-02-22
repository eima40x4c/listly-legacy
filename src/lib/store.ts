import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NetworkState {
  isOffline: boolean;
  isSyncing: boolean;
  setOffline: (_offline: boolean) => void;
  setSyncing: (_syncing: boolean) => void;
}

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

interface SyncState {
  offlineQueue: Record<string, unknown>[];
  addToQueue: (_action: Record<string, unknown>) => void;
  clearQueue: () => void;
}

interface AppState extends NetworkState, UIState, SyncState {}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Network State
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      isSyncing: false,
      setOffline: (offline) => set({ isOffline: offline }),
      setSyncing: (syncing) => set({ isSyncing: syncing }),

      // UI State
      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),

      // Sync State
      offlineQueue: [],
      addToQueue: (action) =>
        set((state) => ({ offlineQueue: [...state.offlineQueue, action] })),
      clearQueue: () => set({ offlineQueue: [] }),
    }),
    {
      name: 'listly-storage',
      partialize: (state) => ({
        // Only persist specific fields if needed
        offlineQueue: state.offlineQueue,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
