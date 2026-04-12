'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Send, RotateCcw, ArrowRight } from 'lucide-react';
import type { QuizQuestion } from '@/types';

interface QuizViewProps {
  questions: QuizQuestion[];
  dayNumber: number;
  bookId: number;
  classLevel: string;
  onComplete: (score: number) => void;
}

export function QuizView({ questions, dayNumber, bookId, classLevel, onComplete }: QuizViewProps) {
  const [answers, setAnswers] = useState<(string | number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const isEarly = ['lkg', 'ukg', '1', '2', '3', '4'].includes(classLevel.toLowerCase());

  const handleMCQ = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleShort = (qIdx: number, value: string) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, dayNumber, answers }),
      });
      const data = await res.json() as { score?: number };
      const finalScore = data.score ?? 0;
      setScore(finalScore);
      setSubmitted(true);
      onComplete(finalScore);
    } catch {
      setLoading(false);
    }
    setLoading(false);
  };

  const optionColors = ['bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/30 dark:border-blue-700',
    'bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:border-green-700',
    'bg-yellow-100 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700',
    'bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/30 dark:border-purple-700'];

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {submitted && score !== null && (
        <div className={`rounded-2xl p-6 text-center border-2 ${score >= 70 ? 'bg-green-50 dark:bg-green-900/20 border-green-300' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300'}`}>
          <div className="text-5xl mb-3">
            {isEarly ? (score >= 70 ? '🎉🌟🎊' : '😊💪') : (score >= 70 ? '🎉' : '💪')}
          </div>
          <h3 className="font-nunito text-2xl font-extrabold text-gray-900 dark:text-white">
            {score >= 70 ? 'Great job!' : 'Keep it up!'}
          </h3>
          <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{score}%</p>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            {score >= 90 ? 'Outstanding performance!' : score >= 70 ? 'Well done!' : 'Review and try again!'}
          </p>
        </div>
      )}

      {questions.map((q, qIdx) => {
        const answer = answers[qIdx];
        const isCorrect = submitted && q.type === 'mcq' && answer === q.correctAnswer;
        const isWrong = submitted && q.type === 'mcq' && answer !== null && answer !== q.correctAnswer;

        return (
          <div
            key={q.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border transition-colors ${
              submitted
                ? isCorrect
                  ? 'border-green-300 dark:border-green-700'
                  : isWrong
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-200 dark:border-gray-700'
                : 'border-gray-100 dark:border-gray-700'
            }`}
          >
            {/* Question */}
            <div className="flex items-start gap-3 mb-4">
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isEarly ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-600 text-white'}`}>
                {qIdx + 1}
              </span>
              <div className="flex-1">
                <p className={`font-semibold text-gray-900 dark:text-white ${isEarly ? 'text-lg' : ''}`}>
                  {q.question}
                </p>
                {submitted && q.type === 'mcq' && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {isCorrect
                      ? <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-green-600 dark:text-green-400 font-medium">Correct!</span></>
                      : <><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-red-600 dark:text-red-400 font-medium">Correct answer: {q.options?.[q.correctAnswer as number]}</span></>
                    }
                  </div>
                )}
              </div>
            </div>

            {/* MCQ Options */}
            {q.type === 'mcq' && q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = answer === optIdx;
                  const isCorrectOpt = submitted && optIdx === q.correctAnswer;
                  const isWrongSelect = submitted && isSelected && !isCorrectOpt;

                  let cls = `relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isEarly ? 'text-lg' : 'text-sm'} font-medium `;
                  if (!submitted) {
                    cls += isSelected
                      ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/40 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                      : `${optionColors[optIdx % 4]} text-gray-700 dark:text-gray-300`;
                  } else if (isCorrectOpt) {
                    cls += 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500 text-green-700 dark:text-green-300';
                  } else if (isWrongSelect) {
                    cls += 'bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-400 text-red-700 dark:text-red-300';
                  } else {
                    cls += 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleMCQ(qIdx, optIdx)}
                      disabled={submitted}
                      className={cls}
                    >
                      <span className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-current flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {optionLetters[optIdx]}
                      </span>
                      <span>{opt}</span>
                      {submitted && isCorrectOpt && <CheckCircle className="w-4 h-4 ml-auto text-green-500" />}
                      {submitted && isWrongSelect && <XCircle className="w-4 h-4 ml-auto text-red-500" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer */}
            {q.type === 'short' && (
              <div>
                <textarea
                  value={(answer as string) ?? ''}
                  onChange={(e) => handleShort(qIdx, e.target.value)}
                  disabled={submitted}
                  placeholder="Write your answer here..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border-2 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    submitted ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                />
                {submitted && q.correctAnswer && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Expected Answer:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{q.correctAnswer as string}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit / Actions */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={loading || answers.some((a) => a === null)}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
        >
          <Send className="w-5 h-5" />
          Submit Answers
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => { setSubmitted(false); setAnswers(new Array(questions.length).fill(null)); setScore(null); }}
            className="flex-1 py-3 border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href={`../lecture/${dayNumber + 1}`}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Next Lecture
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
