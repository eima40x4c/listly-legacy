'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function OfflineIndicator() {
  useEffect(() => {
    function onOffline() {
      toast.error("You're offline", {
        description: 'Changes saved locally.',
        icon: <WifiOff className="h-4 w-4" />,
        duration: 4000, // Auto-dismiss after 4 seconds
        position: 'top-right',
        id: 'offline-toast',
      });
    }

    function onOnline() {
      toast.success("You're online", {
        description: 'Syncing...',
        icon: <Wifi className="h-4 w-4" />,
        duration: 2000,
        position: 'top-right',
        id: 'online-toast',
      });
      toast.dismiss('offline-toast');
    }

    // Check initial state
    if (!window.navigator.onLine) {
      onOffline();
    }

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return null;
}
