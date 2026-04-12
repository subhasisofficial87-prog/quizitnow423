'use client';

import { BookOpen, Target, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function AboutSection() {
  const { get } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* What is QuizItNow */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-nunito text-xl font-bold text-gray-900 dark:text-white mb-3">
              {get('about.title', 'What is QuizItNow?')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {get('about.content', 'QuizItNow is an AI-powered learning platform designed for Indian school students.')}
            </p>
          </div>

          {/* About Us */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-nunito text-xl font-bold text-gray-900 dark:text-white mb-3">
              {get('aboutUs.title', 'About Us')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {get('aboutUs.content', 'We are a team of educators and technologists passionate about making quality education accessible.')}
            </p>
          </div>

          {/* Our Aim */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            </div>
            <h3 className="font-nunito text-xl font-bold text-gray-900 dark:text-white mb-3">
              {get('aim.title', 'Our Aim')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {get('aim.content', 'To empower every Indian student with AI-assisted personalized learning.')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
