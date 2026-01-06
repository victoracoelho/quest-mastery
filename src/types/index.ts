// RevisaQuest - Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  isActive: boolean;
}

export interface Topic {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  notes: string;
  createdAt: string;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  totalReviews: number;
  lastScorePercent: number | null;
}

export interface ReviewLog {
  id: string;
  userId: string;
  topicId: string;
  reviewedAt: string;
  correctAnswers: number;
  scorePercent: number;
  nextReviewAtComputed: string;
  reviewNote: string;
}

export interface DailyPlan {
  id: string;
  userId: string;
  dateISO: string;
  topicIdsSelected: string[];
  topicIdsCompleted: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  userId: string;
  cardsPorDia: number;
  questoesPorTopico: number; // Fixed at 10
}

// Kanban types
export type KanbanColumn = 'todo' | 'progress' | 'done';

export interface KanbanCard {
  topicId: string;
  column: KanbanColumn;
  topic: Topic;
  subject: Subject;
}

// Form types
export interface SubjectFormData {
  name: string;
  topics: string; // Newline-separated
}

export interface ReviewFormData {
  correctAnswers: number;
  reviewNote: string;
}

// Topic with enriched data
export interface TopicWithSubject extends Topic {
  subject: Subject;
  reviewLogs: ReviewLog[];
}
