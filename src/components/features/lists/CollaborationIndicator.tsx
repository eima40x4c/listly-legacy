import { Avatar } from '@/components/ui/Avatar';

type User = {
  user_id: string;
  name: string | null;
  avatar: string | null;
};

interface CollaborationIndicatorProps {
  users: User[];
  currentUserId?: string;
}

export function CollaborationIndicator({
  users,
  currentUserId,
}: CollaborationIndicatorProps) {
  if (users.length <= 1) return null; // Don't show if only current user is there

  // Don't show if only current user is there
  const others = users.filter((u) => u.user_id !== currentUserId);
  const displayUsers = others.slice(0, 3);
  const overflow = others.length - 3;

  return (
    <div className="mr-2 flex -space-x-2">
      {displayUsers.map((user) => (
        <Avatar
          key={user.user_id}
          className="h-8 w-8 border-2 border-background"
          title={user.name || 'Unknown User'}
          src={user.avatar || undefined}
          fallback={user.name?.slice(0, 2).toUpperCase() || '??'}
          alt={user.name || 'User'}
        />
      ))}
      {overflow > 0 && (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
          title={`${overflow} more users`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
