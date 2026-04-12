'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const boards = [
  {
    key: 'odia',
    href: '/OdiaBoard',
    gradient: 'from-orange-500 to-orange-600',
    bg: 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    emoji: '🏛️',
    langColor: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  },
  {
    key: 'cbse',
    href: '/CBSE',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    emoji: '📚',
    langColor: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  },
  {
    key: 'icse',
    href: '/ICSE',
    gradient: 'from-green-500 to-green-600',
    bg: 'from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20',
    border: 'border-green-200 dark:border-green-800',
    emoji: '🎓',
    langColor: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  },
];

export function BoardSelector() {
  const { get } = useTranslation();
  const router = useRouter();

  return (
    <section className="py-20 bg-white dark:bg-gray-900" id="boards">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-nunito text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {get('boards.title', 'Choose Your Board')}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {get('boards.subtitle', 'Personalized study plans for every curriculum')}
          </p>
          <div className="mt-3 w-16 h-1.5 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boards.map((board) => (
            <button
              key={board.key}
              onClick={() => router.push(board.href)}
              className={`group relative text-left bg-gradient-to-br ${board.bg} border ${board.border} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
            >
              {/* Top gradient bar */}
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${board.gradient} rounded-t-2xl`} />

              <div className="text-5xl mb-4">{board.emoji}</div>

              <h3 className="font-nunito text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                {get(`boards.${board.key}.name`, board.key.toUpperCase())}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {get(`boards.${board.key}.desc`, '')}
              </p>

              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${board.langColor} mb-6`}>
                {get(`boards.${board.key}.lang`, '')}
              </span>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Learning</span>
                <div className={`w-8 h-8 bg-gradient-to-r ${board.gradient} rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md`}>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
