import { BookOpen } from 'lucide-react';

/**
 * StoryHero brand lockup with the "by EngBrain" parent-brand line.
 * variant 'dark'  → on light backgrounds (header)
 * variant 'light' → on dark backgrounds (footer)
 */
export function Logo({ variant = 'dark', size = 'md' }: { variant?: 'dark' | 'light'; size?: 'sm' | 'md' }) {
  const icon = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const word = size === 'sm' ? 'text-xl' : 'text-2xl';
  const wordGrad =
    variant === 'light'
      ? 'from-purple-400 to-pink-400'
      : 'from-purple-600 to-pink-600';
  const byColor = variant === 'light' ? 'text-gray-400' : 'text-gray-400';
  const brandColor = variant === 'light' ? 'text-purple-300' : 'text-purple-500';
  const iconColor = variant === 'light' ? 'text-purple-400' : 'text-purple-600';

  return (
    <span className="inline-flex items-center gap-2">
      <BookOpen className={`${icon} ${iconColor} shrink-0`} />
      <span className="flex flex-col leading-none">
        <span className={`${word} font-bold bg-gradient-to-r ${wordGrad} bg-clip-text text-transparent`}>
          StoryHero
        </span>
        <span className={`mt-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase ${byColor}`}>
          by <span className={brandColor}>EngBrain</span>
        </span>
      </span>
    </span>
  );
}
