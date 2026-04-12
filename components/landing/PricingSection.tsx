'use client';

import Link from 'next/link';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function PricingSection() {
  const { get } = useTranslation();

  const basicFeatures = [
    get('pricing.basic.f1', 'Unlimited lectures'),
    get('pricing.basic.f2', 'Daily quizzes'),
    get('pricing.basic.f3', 'Progress tracking'),
    get('pricing.basic.f4', '200-day study plan'),
    get('pricing.basic.f5', '3 books max'),
    get('pricing.basic.f6', 'Email support'),
  ];

  const proFeatures = [
    get('pricing.pro.f1', 'Everything in Basic'),
    get('pricing.pro.f2', 'Unlimited books'),
    get('pricing.pro.f3', 'AI Doubt Clearing Chat'),
    get('pricing.pro.f4', 'Weekend sessions'),
    get('pricing.pro.f5', 'Priority support'),
    get('pricing.pro.f6', 'Badge system'),
    get('pricing.pro.f7', 'Multi-language support'),
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-nunito text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {get('pricing.title', 'Simple, Affordable Plans')}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Start free, upgrade when you love it. Cancel anytime.
          </p>
          <div className="mt-3 w-16 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
        </div>

        {/* Trial Banner */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-center text-white shadow-lg">
            <p className="font-bold text-lg">{get('trial.badge', '🎉 Free Trial')}</p>
            <p className="text-sm font-medium opacity-90">{get('trial.message', 'First 5 days completely FREE! No credit card needed.')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-nunito text-xl font-bold text-gray-900 dark:text-white">
                {get('pricing.basic.name', 'Basic')}
              </h3>
            </div>

            <div className="flex items-baseline gap-1 mb-6 mt-4">
              <span className="font-nunito text-4xl font-extrabold text-gray-900 dark:text-white">
                {get('pricing.basic.price', '₹299')}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                {get('pricing.basic.period', '/month')}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {basicFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="block w-full text-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow text-white">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <h3 className="font-nunito text-xl font-bold">
                {get('pricing.pro.name', 'Pro')}
              </h3>
            </div>

            <div className="flex items-baseline gap-1 mb-6 mt-4">
              <span className="font-nunito text-4xl font-extrabold">
                {get('pricing.pro.price', '₹499')}
              </span>
              <span className="text-blue-200 font-medium">
                {get('pricing.pro.period', '/month')}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-blue-50">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="block w-full text-center py-3 px-6 bg-white text-blue-700 font-bold rounded-xl transition-all hover:bg-blue-50 shadow-md"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
