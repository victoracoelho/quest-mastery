import { Topic } from '@/types';
import { getItem, setItem, generateId } from '@/lib/storage';

const TOPICS_KEY = 'topics';

export function getAllTopics(): Topic[] {
  return getItem<Topic[]>(TOPICS_KEY) || [];
}

export function getTopicsByUser(userId: string): Topic[] {
  return getAllTopics().filter(t => t.userId === userId);
}

export function getTopicsBySubject(subjectId: string): Topic[] {
  return getAllTopics().filter(t => t.subjectId === subjectId);
}

export function getTopicById(id: string): Topic | undefined {
  return getAllTopics().find(t => t.id === id);
}

export function createTopic(userId: string, subjectId: string, title: string): Topic {
  const topics = getAllTopics();
  const newTopic: Topic = {
    id: generateId(),
    userId,
    subjectId,
    title,
    notes: '',
    createdAt: new Date().toISOString(),
    lastReviewedAt: null,
    nextReviewAt: null,
    totalReviews: 0,
    lastScorePercent: null,
  };
  topics.push(newTopic);
  setItem(TOPICS_KEY, topics);
  return newTopic;
}

export function createTopicsBatch(userId: string, subjectId: string, titles: string[]): Topic[] {
  const topics = getAllTopics();
  const newTopics: Topic[] = titles.map(title => ({
    id: generateId(),
    userId,
    subjectId,
    title: title.trim(),
    notes: '',
    createdAt: new Date().toISOString(),
    lastReviewedAt: null,
    nextReviewAt: null,
    totalReviews: 0,
    lastScorePercent: null,
  }));
  topics.push(...newTopics);
  setItem(TOPICS_KEY, topics);
  return newTopics;
}

export function updateTopic(id: string, updates: Partial<Topic>): Topic | null {
  const topics = getAllTopics();
  const idx = topics.findIndex(t => t.id === id);
  if (idx === -1) return null;
  
  topics[idx] = { ...topics[idx], ...updates };
  setItem(TOPICS_KEY, topics);
  return topics[idx];
}

export function deleteTopic(id: string): void {
  const topics = getAllTopics();
  setItem(TOPICS_KEY, topics.filter(t => t.id !== id));
}

export function deleteTopicsBySubject(subjectId: string): void {
  const topics = getAllTopics();
  setItem(TOPICS_KEY, topics.filter(t => t.subjectId !== subjectId));
}
