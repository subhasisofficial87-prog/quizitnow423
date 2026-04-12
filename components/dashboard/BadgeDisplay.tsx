'use client';

import type { Badge } from '@/types';

interface BadgeDisplayProps {
  badges: Badge[];
}

const BADGE_META: Record<string, { icon: string; label: string; color: string }> = {
  first_lecture: { icon: '📖', label: 'First Lecture', color: 'from-blue-400 to-blue-600' },
  first_quiz: { icon: '✏️', label: 'First Quiz', color: 'from-green-400 to-green-600' },
  week_streak: { icon: '🔥', label: '7-Day Streak', color: 'from-orange-400 to-red-500' },
  perfect_score: { icon: '💯', label: 'Perfect Score', color: 'from-yellow-400 to-orange-500' },
  month_streak: { icon: '🏅', label: '30-Day Streak', color: 'from-purple-400 to-purple-600' },
  book_complete: { icon: '🏆', label: 'Book Complete', color: 'from-yellow-500 to-yellow-600' },
  doubt_master: { icon: '💬', label: 'Doubt Master', color: 'from-teal-400 to-teal-600' },
  early_bird: { icon: '🌅', label: 'Early Bird', color: 'from-pink-400 to-pink-600' },
};

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-nunito font-bold text-gray-900 dark:text-white mb-3">Badges</h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Complete lectures and quizzes to earn badges!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-nunito font-bold text-gray-900 dark:text-white mb-4">
        Badges Earned ({badges.length})
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {badges.map((badge) => {
          const meta = BADGE_META[badge.badge_type] ?? {
            icon: '⭐',
            label: badge.badge_type,
            color: 'from-gray-400 to-gray-600',
          };
          return (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1.5 group cursor-default"
              title={meta.label}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                {meta.icon}
              </div>
              <span className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium leading-tight">
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
