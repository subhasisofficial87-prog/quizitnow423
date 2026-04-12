'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface BenefitItem {
  icon: string;
  title: string;
  desc: string;
}

export function BenefitsSection() {
  const { get } = useTranslation();

  const items: BenefitItem[] = [
    { icon: '🧠', title: get('benefits.item1.title', 'AI-Powered Lectures'), desc: get('benefits.item1.desc', 'Personalized lessons generated from your own textbooks') },
    { icon: '📝', title: get('benefits.item2.title', 'Daily Quizzes'), desc: get('benefits.item2.desc', 'Smart quizzes to test your understanding every day') },
    { icon: '💬', title: get('benefits.item3.title', 'Doubt Clearing'), desc: get('benefits.item3.desc', 'Ask any question and get instant AI-powered answers') },
    { icon: '📅', title: get('benefits.item4.title', '200-Day Plan'), desc: get('benefits.item4.desc', 'Complete study plan covering your full academic year') },
    { icon: '🏆', title: get('benefits.item5.title', 'Earn Badges'), desc: get('benefits.item5.desc', 'Stay motivated with streaks, badges and achievements') },
    { icon: '🌐', title: get('benefits.item6.title', 'Multi-language'), desc: get('benefits.item6.desc', 'Study in English, Hindi, or Odia — your choice!') },
  ];

  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-orange-500',
    'from-purple-500 to-purple-600',
    'from-red-500 to-pink-500',
    'from-teal-500 to-teal-600',
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900" id="benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-nunito text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {get('benefits.title', 'Why Students Love QuizItNow')}
          </h2>
          <div className="mt-3 w-16 h-1.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors[i % colors.length]}`} />
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-nunito text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
