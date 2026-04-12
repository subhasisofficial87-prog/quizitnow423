import Anthropic from '@anthropic-ai/sdk';
import type { QuizQuestion } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-5';

type Language = 'english' | 'hindi' | 'odia';
type Board = 'odia_board' | 'cbse' | 'icse';

function getClassNum(classLevel: string): number {
  if (classLevel === 'lkg') return 0;
  if (classLevel === 'ukg') return 0.5;
  return parseInt(classLevel) || 1;
}

export function getSystemPrompt(board: Board, classLevel: string, language: Language): string {
  const classNum = getClassNum(classLevel);

  let ageStyle = '';
  if (classNum <= 4) {
    ageStyle = `You are a fun, playful teacher for very young children (${classLevel} class).
Use simple words, short sentences, and lots of emojis 🌟🎉🐘.
Tell things like stories. Use examples from everyday life kids can relate to.
Never use complex vocabulary. Be very encouraging and positive.
Celebrate every small success with enthusiasm!`;
  } else if (classNum <= 8) {
    ageStyle = `You are a friendly, encouraging teacher for middle school students (Class ${classLevel}).
Use clear explanations with relatable examples.
Be engaging and interactive. Use some emojis but stay focused.
Build concepts step by step. Connect to real-world applications.`;
  } else {
    ageStyle = `You are a thorough, exam-focused teacher for senior students (Class ${classLevel}).
Provide structured, comprehensive content.
Include key concepts, formulas, examples, and exam tips.
Be precise and academically rigorous. Cover all important aspects.`;
  }

  let boardContext = '';
  if (board === 'odia_board') {
    boardContext = 'This is an Odia Board curriculum. Focus on Odia state syllabus, culture, and context.';
  } else if (board === 'cbse') {
    boardContext = 'This is CBSE curriculum. Follow NCERT guidelines and standard CBSE patterns.';
  } else {
    boardContext = 'This is ICSE curriculum. Follow CISCE guidelines and detailed ICSE syllabus.';
  }

  let languageInstruction = '';
  if (language === 'hindi') {
    languageInstruction = 'Respond entirely in Hindi using Devanagari script (हिंदी में उत्तर दें).';
  } else if (language === 'odia') {
    languageInstruction = 'Respond entirely in Odia script (ଓଡ଼ିଆ ଭାଷାରେ ଉତ୍ତର ଦିଅ).';
  } else {
    languageInstruction = 'Respond in clear, simple English.';
  }

  return `${ageStyle}\n\n${boardContext}\n\n${languageInstruction}`;
}

export interface StudyPlanResult {
  extractedText: string;
  studyPlan: object;
  syllabusTopics: string[];
}

export async function extractAndPlan(
  fileType: 'pdf' | 'images',
  classLevel: string,
  board: Board,
  base64Pdf?: string,
  images?: string[]
): Promise<StudyPlanResult> {
  const systemPrompt = getSystemPrompt(board, classLevel, 'english');

  // Step 1: Extract text from the book
  let extractionContent: Anthropic.MessageParam['content'] = [];

  if (fileType === 'pdf' && base64Pdf) {
    extractionContent = [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Pdf,
        },
      } as Anthropic.DocumentBlockParam,
      {
        type: 'text',
        text: `Please extract all the text content from this ${board} Class ${classLevel} textbook/notes.
Return the complete extracted text preserving chapter structure, headings, and key content.
Format: Return as plain text with clear chapter/section markers.`,
      },
    ];
  } else if (fileType === 'images' && images && images.length > 0) {
    const imageBlocks: Anthropic.ImageBlockParam[] = images.slice(0, 20).map((img) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: img,
      },
    }));
    extractionContent = [
      ...imageBlocks,
      {
        type: 'text',
        text: `Please extract all the text content from these ${board} Class ${classLevel} textbook pages.
Return the complete extracted text preserving chapter structure, headings, and key content.
Format: Return as plain text with clear chapter/section markers.`,
      },
    ];
  } else {
    return {
      extractedText: 'No content provided',
      studyPlan: { weeks: [] },
      syllabusTopics: [],
    };
  }

  const extractionResponse = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: extractionContent }],
  });

  const extractedText = extractionResponse.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('\n');

  // Step 2: Create study plan
  const planResponse = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Based on this ${board} Class ${classLevel} textbook content, create a comprehensive 200-day study plan.

Book Content Summary:
${extractedText.slice(0, 4000)}

Rules:
- 200 weekday sessions (Monday to Friday = lecture + quiz days)
- Saturday/Sunday = revision and doubt clearing days
- Distribute topics evenly across the weeks
- Start from today

Return ONLY valid JSON in this exact format:
{
  "syllabusTopics": ["topic1", "topic2", ...],
  "overview": "Brief overview of the book",
  "totalWeeks": 40,
  "weeks": [
    {
      "week": 1,
      "days": [
        {"day": 1, "weekday": "Monday", "type": "lecture", "topic": "Introduction to ..."},
        {"day": 2, "weekday": "Tuesday", "type": "lecture", "topic": "Chapter 1: ..."},
        {"day": 3, "weekday": "Wednesday", "type": "lecture", "topic": "..."},
        {"day": 4, "weekday": "Thursday", "type": "lecture", "topic": "..."},
        {"day": 5, "weekday": "Friday", "type": "lecture", "topic": "..."},
        {"day": 6, "weekday": "Saturday", "type": "revision", "topic": "Week 1 revision"},
        {"day": 7, "weekday": "Sunday", "type": "doubt", "topic": "Doubt clearing session"}
      ]
    }
  ]
}`,
      },
    ],
  });

  const planText = planResponse.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('');

  let studyPlan: object = { weeks: [] };
  let syllabusTopics: string[] = [];

  try {
    const jsonMatch = planText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { syllabusTopics?: string[]; weeks?: unknown[] };
      syllabusTopics = parsed.syllabusTopics ?? [];
      studyPlan = parsed;
    }
  } catch {
    studyPlan = { weeks: [], error: 'Failed to parse plan' };
  }

  return { extractedText, studyPlan, syllabusTopics };
}

export async function generateLecture(
  topic: string,
  extractedText: string,
  dayNumber: number,
  classLevel: string,
  board: Board,
  language: Language
): Promise<string> {
  const systemPrompt = getSystemPrompt(board, classLevel, language);
  const classNum = getClassNum(classLevel);

  const lengthInstruction =
    classNum <= 4
      ? 'Create a 15-20 minute story-based lesson with fun activities and examples.'
      : 'Create a comprehensive 30-minute structured lesson covering all key points.';

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Day ${dayNumber} Lecture on: "${topic}"

Reference material from the textbook:
${extractedText.slice(0, 6000)}

${lengthInstruction}

Structure your lesson with:
1. Introduction / Hook (grab attention)
2. Main Content (explain the topic clearly)
3. Examples and Practice
4. Summary / Key Points
5. What to Remember

Make it engaging and educational for Class ${classLevel} students.`,
      },
    ],
  });

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('\n');
}

export async function generateQuiz(
  topic: string,
  extractedText: string,
  dayNumber: number,
  classLevel: string,
  language: Language
): Promise<QuizQuestion[]> {
  const classNum = getClassNum(classLevel);

  let questionSpec = '';
  if (classNum <= 2) {
    questionSpec = '3 very simple MCQ questions with 2 options each (A/B). Use simple words.';
  } else if (classNum <= 6) {
    questionSpec = '4 MCQ questions with 4 options each, and 1 short answer question.';
  } else {
    questionSpec = '5 MCQ questions with 4 options each, and 2 short answer questions.';
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are creating a quiz for Class ${classLevel} students. ${language !== 'english' ? `Write in ${language}.` : ''}`,
    messages: [
      {
        role: 'user',
        content: `Create a quiz for Day ${dayNumber} on topic: "${topic}"

Reference material:
${extractedText.slice(0, 3000)}

Create ${questionSpec}

Return ONLY valid JSON array:
[
  {
    "id": 1,
    "type": "mcq",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  },
  {
    "id": 2,
    "type": "short",
    "question": "Short answer question?",
    "correctAnswer": "Expected answer"
  }
]`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('');

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as QuizQuestion[];
    }
  } catch {
    // Return a default quiz on parse failure
  }

  return [
    {
      id: 1,
      type: 'mcq',
      question: `What did you learn about "${topic}" today?`,
      options: ['I learned a lot!', 'I need to review', 'It was interesting', 'I have questions'],
      correctAnswer: 0,
    },
  ];
}

export async function scoreQuiz(
  questions: QuizQuestion[],
  userAnswers: (string | number)[]
): Promise<number> {
  let score = 0;
  let mcqCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const ua = userAnswers[i];

    if (q.type === 'mcq') {
      mcqCount++;
      if (ua !== undefined && ua !== null && ua === q.correctAnswer) {
        score++;
      }
    }
  }

  // For short answers, use AI to score (simplified: award partial credit)
  const shortAnswers = questions.filter((q) => q.type === 'short');
  if (shortAnswers.length > 0) {
    const shortScore = Math.floor(shortAnswers.length * 0.7); // 70% default for attempt
    score += shortScore;
  }

  const total = questions.length;
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export async function doubtChat(
  question: string,
  extractedText: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  classLevel: string,
  language: Language
): Promise<string> {
  const classNum = getClassNum(classLevel);
  const board: Board = 'cbse'; // default for doubt
  const systemPrompt = getSystemPrompt(board, classLevel, language);

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    {
      role: 'user',
      content: `${question}\n\n[Context from textbook: ${extractedText.slice(0, 2000)}]`,
    },
  ];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: classNum <= 4 ? 1024 : 2048,
    system: `${systemPrompt}\n\nYou are answering doubts and questions from students. Be patient, clear, and encouraging.`,
    messages,
  });

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('\n');
}
