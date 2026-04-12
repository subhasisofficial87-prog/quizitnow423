export interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan: 'free' | 'basic' | 'pro';
  plan_expires_at: string | null;
  trial_start_date: string | null;
  language: 'english' | 'hindi' | 'odia';
  created_at: string;
}

export interface Book {
  id: number;
  user_id: number;
  board: 'odia_board' | 'cbse' | 'icse';
  class_level: string;
  title: string | null;
  original_filename: string | null;
  file_type: 'pdf' | 'images';
  extracted_text: string | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
}

export interface StudyPlan {
  id: number;
  book_id: number;
  user_id: number;
  total_days: number;
  start_date: string;
  syllabus_topics: string[] | null;
  plan_data: WeekPlan[] | null;
  created_at: string;
}

export interface DayPlan {
  day: number;
  date?: string;
  type: 'lecture' | 'doubt' | 'revision';
  topic?: string;
  weekday: string;
}

export interface WeekPlan {
  week: number;
  days: DayPlan[];
}

export interface DailySession {
  id: number;
  book_id: number;
  user_id: number;
  day_number: number;
  session_date: string;
  topic: string | null;
  lecture_content: string | null;
  lecture_at: string | null;
  quiz_questions: QuizQuestion[] | null;
  quiz_answers: string[] | null;
  quiz_score: number | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  type: 'mcq' | 'short';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
}

export interface DoubtMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Badge {
  id: number;
  user_id: number;
  badge_type: string;
  earned_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  plan: 'basic' | 'pro' | null;
  amount: number | null;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export type BoardType = 'OdiaBoard' | 'CBSE' | 'ICSE';
export type ClassLevel = 'lkg' | 'ukg' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type ClassGroup = 'early' | 'middle' | 'senior';
