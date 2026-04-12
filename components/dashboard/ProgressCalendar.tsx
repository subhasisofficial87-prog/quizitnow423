'use client';

import { useMemo } from 'react';
import type { DailySession } from '@/types';

interface ProgressCalendarProps {
  sessions: DailySession[];
}

export function ProgressCalendar({ sessions }: ProgressCalendarProps) {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const session = sessions.find((s) => s.session_date === dateStr);
      result.push({
        date,
        dateStr,
        session,
        isToday: i === 0,
      });
    }
    return result;
  }, [sessions]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-nunito font-bold text-gray-900 dark:text-white mb-4">Last 30 Days</h3>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for alignment */}
        {Array.from({ length: days[0].date.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(({ date, session, isToday }) => {
          let bg = 'bg-gray-100 dark:bg-gray-700';
          let ring = '';

          if (session?.completed) {
            const score = session.quiz_score ?? 0;
            if (score >= 80) bg = 'bg-green-500';
            else if (score >= 50) bg = 'bg-yellow-400';
            else bg = 'bg-blue-400';
          } else if (session) {
            bg = 'bg-blue-200 dark:bg-blue-800';
          }

          if (isToday) ring = 'ring-2 ring-blue-500 ring-offset-1';

          return (
            <div
              key={date.toISOString()}
              className={`aspect-square rounded-md ${bg} ${ring} transition-colors`}
              title={`${date.toLocaleDateString('en-IN')}${session ? ` - Score: ${session.quiz_score ?? 'N/A'}%` : ''}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {[
          { color: 'bg-green-500', label: 'Excellent (≥80%)' },
          { color: 'bg-yellow-400', label: 'Good (≥50%)' },
          { color: 'bg-blue-400', label: 'Done' },
          { color: 'bg-gray-100 dark:bg-gray-700', label: 'No session' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
