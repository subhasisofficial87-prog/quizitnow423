'use client';

import Link from 'next/link';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function HeroSection() {
  const { get } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-green-200/30 dark:bg-green-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100/20 dark:bg-yellow-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trial Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg mb-6 animate-bounce-in">
            <Sparkles className="w-4 h-4" />
            {get('trial.badge', '🎉 Free Trial')} — {get('trial.message', 'First 5 days completely FREE!')}
          </div>

          {/* Headline */}
          <h1 className="font-nunito text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 animate-fade-in-up">
            {get('hero.headline', 'Learn Smarter, Score Higher!')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mt-2">
              With AI Study Partner
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {get('hero.subheadline', 'AI-powered study companion for Odia Board, CBSE & ICSE students.')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 text-lg"
            >
              {get('hero.cta', 'Start Free Trial')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#boards"
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-2xl shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 text-lg"
            >
              <Play className="w-5 h-5 text-blue-600" />
              {get('hero.secondary', 'See How It Works')}
            </a>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { num: '10K+', label: 'Students' },
              { num: '3', label: 'Boards' },
              { num: '200', label: 'Day Plan' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-nunito text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stat.num}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
