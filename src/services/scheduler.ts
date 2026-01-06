/**
 * Scheduler Service
 * 
 * Responsible for calculating the next review date based on performance.
 * 
 * RULE (3/10/15 days):
 * - Score < 70% (0-6 correct): +3 days
 * - Score 70-79% (7 correct): +10 days
 * - Score >= 80% (8-10 correct): +15 days
 */

import { addDays, getCurrentDateISO } from '@/lib/storage';

export interface ScheduleResult {
  nextReviewAt: string;
  daysUntilReview: number;
  performanceLevel: 'low' | 'medium' | 'high';
}

export function calculateNextReview(correctAnswers: number, baseDate?: string): ScheduleResult {
  const scorePercent = (correctAnswers / 10) * 100;
  const today = baseDate || getCurrentDateISO();
  
  let daysToAdd: number;
  let performanceLevel: 'low' | 'medium' | 'high';
  
  if (scorePercent < 70) {
    // 0-6 correct answers: review in 3 days
    daysToAdd = 3;
    performanceLevel = 'low';
  } else if (scorePercent < 80) {
    // 7 correct answers: review in 10 days
    daysToAdd = 10;
    performanceLevel = 'medium';
  } else {
    // 8-10 correct answers: review in 15 days
    daysToAdd = 15;
    performanceLevel = 'high';
  }
  
  return {
    nextReviewAt: addDays(today, daysToAdd),
    daysUntilReview: daysToAdd,
    performanceLevel,
  };
}

export function getPerformanceLabel(correctAnswers: number): string {
  const scorePercent = (correctAnswers / 10) * 100;
  
  if (scorePercent < 70) {
    return 'Precisa melhorar';
  } else if (scorePercent < 80) {
    return 'Bom';
  } else if (scorePercent < 100) {
    return 'Ótimo';
  } else {
    return 'Excelente!';
  }
}

export function getPerformanceColor(correctAnswers: number): string {
  const scorePercent = (correctAnswers / 10) * 100;
  
  if (scorePercent < 70) {
    return 'text-destructive';
  } else if (scorePercent < 80) {
    return 'text-warning';
  } else {
    return 'text-success';
  }
}

export function getDaysUntilReview(nextReviewAt: string | null): number | null {
  if (!nextReviewAt) return null;
  
  const today = new Date(getCurrentDateISO());
  const reviewDate = new Date(nextReviewAt);
  const diffTime = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function isReviewDue(nextReviewAt: string | null, targetDate?: string): boolean {
  if (!nextReviewAt) return false;
  const compareDate = targetDate || getCurrentDateISO();
  return nextReviewAt <= compareDate;
}

export function isNewTopic(lastReviewedAt: string | null): boolean {
  return lastReviewedAt === null;
}
