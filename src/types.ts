export type QuestionType = 'mcq' | 'coding';

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correct_answer?: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  created_at?: string;
}

export interface Submission {
  id: string;
  exam_id: string;
  candidate_name: string;
  candidate_email: string;
  answers: Record<string, string>;
  score?: number;
  status: 'pending' | 'completed';
  created_at?: string;
}
