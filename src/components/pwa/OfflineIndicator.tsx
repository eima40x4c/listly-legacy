'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useStore } from '@/lib/store';

export function OfflineIndicator() {
  const isOffline = useStore((state) => state.isOffline);
  const isMounted = useRef(false);

  useEffect(() => {
    // Skip initial render to avoid toast on page load if already offline (optional)
    // or keep it to inform user. Let's show it if status changes.
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isOffline) {
      toast.error("You're offline", {
        description: 'Changes saved locally.',
        icon: <WifiOff className="h-4 w-4" />,
        duration: 4000,
        position: 'top-right',
        id: 'offline-toast',
      });
    } else {
      toast.success("You're online", {
        description: 'Syncing...',
        icon: <Wifi className="h-4 w-4" />,
        duration: 2000,
        position: 'top-right',
        id: 'online-toast',
      });
      toast.dismiss('offline-toast');
    }
  }, [isOffline]);

  return null;
}
