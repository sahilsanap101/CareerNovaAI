import { clsx } from 'clsx';

import { getInitials } from '@pathforge/shared-utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

// Consistent color based on name
function getAvatarColor(name?: string): string {
  if (!name) return 'from-slate-400 to-slate-600';
  const colors = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-purple-700',
    'from-emerald-500 to-teal-700',
    'from-orange-500 to-amber-700',
    'from-pink-500 to-rose-700',
    'from-cyan-500 to-sky-700',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index]!;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={clsx('rounded-full object-cover ring-2 ring-white dark:ring-slate-800', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center text-white font-semibold',
        `bg-gradient-to-br ${getAvatarColor(name)}`,
        sizeClasses[size],
        className,
      )}
      aria-label={name ? `${name}'s avatar` : 'Avatar'}
    >
      {getInitials(name ?? '?')}
    </div>
  );
}
