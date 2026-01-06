import { ReviewLog } from '@/types';
import { getItem, setItem, generateId } from '@/lib/storage';

const REVIEW_LOGS_KEY = 'review_logs';

export function getAllReviewLogs(): ReviewLog[] {
  return getItem<ReviewLog[]>(REVIEW_LOGS_KEY) || [];
}

export function getReviewLogsByUser(userId: string): ReviewLog[] {
  return getAllReviewLogs().filter(r => r.userId === userId);
}

export function getReviewLogsByTopic(topicId: string): ReviewLog[] {
  return getAllReviewLogs()
    .filter(r => r.topicId === topicId)
    .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
}

export function createReviewLog(
  userId: string,
  topicId: string,
  correctAnswers: number,
  scorePercent: number,
  nextReviewAtComputed: string,
  reviewNote: string
): ReviewLog {
  const logs = getAllReviewLogs();
  const newLog: ReviewLog = {
    id: generateId(),
    userId,
    topicId,
    reviewedAt: new Date().toISOString(),
    correctAnswers,
    scorePercent,
    nextReviewAtComputed,
    reviewNote,
  };
  logs.push(newLog);
  setItem(REVIEW_LOGS_KEY, logs);
  return newLog;
}

export function deleteReviewLogsByTopic(topicId: string): void {
  const logs = getAllReviewLogs();
  setItem(REVIEW_LOGS_KEY, logs.filter(r => r.topicId !== topicId));
}
