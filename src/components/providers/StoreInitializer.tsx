'use client';

import { useEffect } from 'react';

import { useStore } from '@/lib/store';

export function StoreInitializer() {
  const setOffline = useStore((state) => state.setOffline);

  useEffect(() => {
    function handleOnline() {
      setOffline(false);
    }

    function handleOffline() {
      setOffline(true);
    }

    // Set initial state
    setOffline(!window.navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline]);

  return null;
}
