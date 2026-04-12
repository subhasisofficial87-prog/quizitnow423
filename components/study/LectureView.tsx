'use client';

interface LectureViewProps {
  content: string;
  topic: string;
  dayNumber: number;
  classLevel: string;
}

export function LectureView({ content, topic, dayNumber, classLevel }: LectureViewProps) {
  const isEarly = ['lkg', 'ukg', '1', '2', '3', '4'].includes(classLevel.toLowerCase());

  // Convert markdown-like content to formatted HTML sections
  const sections = content.split('\n\n').filter(Boolean);

  return (
    <article className={`prose dark:prose-invert max-w-none ${isEarly ? 'text-lg' : 'text-base'}`}>
      {/* Lecture Header */}
      <div className={`mb-6 p-5 rounded-2xl ${isEarly ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isEarly ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-600 text-white'}`}>
            Day {dayNumber}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isEarly ? '📚 Today\'s Story Lesson' : '📖 Lecture'}
          </span>
        </div>
        <h1 className={`font-nunito font-extrabold text-gray-900 dark:text-white mt-2 mb-0 ${isEarly ? 'text-2xl' : 'text-xl'}`}>
          {topic}
        </h1>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {sections.map((section, i) => {
          // Detect headers (lines starting with # or **Title**)
          if (section.startsWith('#')) {
            const level = section.match(/^#+/)?.[0].length ?? 1;
            const text = section.replace(/^#+\s*/, '');
            if (level === 1) {
              return <h2 key={i} className="font-nunito text-xl font-bold text-gray-900 dark:text-white mt-6 mb-2">{text}</h2>;
            }
            return <h3 key={i} className="font-nunito text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">{text}</h3>;
          }

          if (section.startsWith('**') && section.includes(':**')) {
            const colonIdx = section.indexOf(':**');
            const heading = section.slice(2, colonIdx);
            const rest = section.slice(colonIdx + 3).trim();
            return (
              <div key={i}>
                <h3 className="font-nunito text-lg font-bold text-gray-900 dark:text-white mb-1">{heading}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{rest}</p>
              </div>
            );
          }

          // Bullet lists
          if (section.includes('\n-') || section.startsWith('-')) {
            const lines = section.split('\n').filter(Boolean);
            const nonBullet = lines.filter((l) => !l.startsWith('-'));
            const bullets = lines.filter((l) => l.startsWith('-')).map((l) => l.slice(1).trim());
            return (
              <div key={i}>
                {nonBullet.map((line, j) => (
                  <p key={j} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{line}</p>
                ))}
                <ul className="space-y-1.5">
                  {bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isEarly ? 'bg-yellow-400 text-xs' : 'bg-blue-500 text-white text-xs'}`}>
                        {isEarly ? '⭐' : '•'}
                      </span>
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          // Numbered lists
          if (/^\d+\./.test(section)) {
            const lines = section.split('\n').filter(Boolean);
            return (
              <ol key={i} className="space-y-2">
                {lines.map((line, j) => (
                  <li key={j} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">{j + 1}.</span>
                    <span className="leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            );
          }

          // Regular paragraph
          return (
            <p key={i} className={`text-gray-700 dark:text-gray-300 leading-relaxed ${isEarly ? 'text-lg' : ''}`}>
              {section}
            </p>
          );
        })}
      </div>
    </article>
  );
}
