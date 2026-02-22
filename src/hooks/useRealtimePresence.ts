import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';

type PresenceState = {
  user_id: string;
  online_at: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
};

export function useRealtimePresence(listId: string) {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<PresenceState[]>([]);

  useEffect(() => {
    if (!listId || !user || !supabase) return;

    const channel = supabase.channel(`list:${listId}:presence`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<PresenceState>();
        // Flatten presence state
        const users = Object.values(newState).flat();
        setActiveUsers(users);
      })
      .on(
        'presence',
        { event: 'join' },
        ({ key: _key, newPresences: _newPresences }) => {
          // console.log('join', key, newPresences);
        }
      )
      .on(
        'presence',
        { event: 'leave' },
        ({ key: _key, leftPresences: _leftPresences }) => {
          // console.log('leave', key, leftPresences);
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            email: user.email,
            name: user.name,
            avatar: user.image, // Ensure this maps to your user object
          });
        }
      });

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [listId, user]);

  return activeUsers;
}
