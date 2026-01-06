/**
 * Plan Generator Service
 * 
 * Responsible for generating the daily study plan.
 * 
 * PRIORITY RULES:
 * 1. Topics with mandatory review today (nextReviewAt <= selectedDate)
 * 2. New topics (never reviewed)
 * 3. Topics with closest future review date
 * 4. Try to diversify subjects when possible
 * 5. Never duplicate topics in the same day
 */

import { Topic, Subject, DailyPlan } from '@/types';
import { getTopicsByUser } from '@/repositories/topicRepository';
import { getSubjectsByUser, getSubjectById } from '@/repositories/subjectRepository';
import { getDailyPlanByDate, createDailyPlan } from '@/repositories/dailyPlanRepository';
import { isReviewDue, isNewTopic } from './scheduler';

export interface PlanGenerationResult {
  plan: DailyPlan;
  isNew: boolean;
  stats: {
    mandatory: number;
    new: number;
    early: number;
  };
}

export function generateDailyPlan(userId: string, dateISO: string, cardsPorDia: number): PlanGenerationResult {
  // Check if plan already exists for this date
  const existingPlan = getDailyPlanByDate(userId, dateISO);
  if (existingPlan) {
    return {
      plan: existingPlan,
      isNew: false,
      stats: calculatePlanStats(existingPlan.topicIdsSelected, dateISO, userId),
    };
  }
  
  const allTopics = getTopicsByUser(userId);
  const activeSubjects = getSubjectsByUser(userId);
  const activeSubjectIds = new Set(activeSubjects.map(s => s.id));
  
  // Filter only topics from active subjects
  const availableTopics = allTopics.filter(t => activeSubjectIds.has(t.subjectId));
  
  if (availableTopics.length === 0) {
    const emptyPlan = createDailyPlan(userId, dateISO, []);
    return {
      plan: emptyPlan,
      isNew: true,
      stats: { mandatory: 0, new: 0, early: 0 },
    };
  }
  
  const selectedTopicIds: string[] = [];
  const usedSubjectIds = new Set<string>();
  
  // Categorize topics
  const mandatoryTopics: Topic[] = [];
  const newTopics: Topic[] = [];
  const futureTopics: Topic[] = [];
  
  for (const topic of availableTopics) {
    if (isReviewDue(topic.nextReviewAt, dateISO)) {
      mandatoryTopics.push(topic);
    } else if (isNewTopic(topic.lastReviewedAt)) {
      newTopics.push(topic);
    } else if (topic.nextReviewAt) {
      futureTopics.push(topic);
    }
  }
  
  // Sort future topics by nearest review date
  futureTopics.sort((a, b) => {
    if (!a.nextReviewAt) return 1;
    if (!b.nextReviewAt) return -1;
    return a.nextReviewAt.localeCompare(b.nextReviewAt);
  });
  
  // Stats tracking
  let mandatoryCount = 0;
  let newCount = 0;
  let earlyCount = 0;
  
  // Helper function to select topic with diversity preference
  const selectWithDiversity = (topics: Topic[]): Topic | null => {
    // First try to find a topic from a different subject
    const diverseTopic = topics.find(t => !usedSubjectIds.has(t.subjectId));
    if (diverseTopic) return diverseTopic;
    // Otherwise, return the first available
    return topics[0] || null;
  };
  
  // Priority 1: Mandatory reviews (MUST be included even if same subject)
  for (const topic of mandatoryTopics) {
    if (selectedTopicIds.length >= cardsPorDia) break;
    if (!selectedTopicIds.includes(topic.id)) {
      selectedTopicIds.push(topic.id);
      usedSubjectIds.add(topic.subjectId);
      mandatoryCount++;
    }
  }
  
  // Priority 2: New topics (with diversity preference)
  while (selectedTopicIds.length < cardsPorDia && newTopics.length > 0) {
    const remaining = newTopics.filter(t => !selectedTopicIds.includes(t.id));
    const selected = selectWithDiversity(remaining);
    if (!selected) break;
    
    selectedTopicIds.push(selected.id);
    usedSubjectIds.add(selected.subjectId);
    newCount++;
    newTopics.splice(newTopics.indexOf(selected), 1);
  }
  
  // Priority 3: Future reviews (with diversity preference)
  while (selectedTopicIds.length < cardsPorDia && futureTopics.length > 0) {
    const remaining = futureTopics.filter(t => !selectedTopicIds.includes(t.id));
    const selected = selectWithDiversity(remaining);
    if (!selected) break;
    
    selectedTopicIds.push(selected.id);
    usedSubjectIds.add(selected.subjectId);
    earlyCount++;
    futureTopics.splice(futureTopics.indexOf(selected), 1);
  }
  
  const newPlan = createDailyPlan(userId, dateISO, selectedTopicIds);
  
  return {
    plan: newPlan,
    isNew: true,
    stats: {
      mandatory: mandatoryCount,
      new: newCount,
      early: earlyCount,
    },
  };
}

function calculatePlanStats(topicIds: string[], dateISO: string, userId: string): { mandatory: number; new: number; early: number } {
  const allTopics = getTopicsByUser(userId);
  let mandatory = 0;
  let newCount = 0;
  let early = 0;
  
  for (const topicId of topicIds) {
    const topic = allTopics.find(t => t.id === topicId);
    if (!topic) continue;
    
    if (isReviewDue(topic.nextReviewAt, dateISO)) {
      mandatory++;
    } else if (isNewTopic(topic.lastReviewedAt)) {
      newCount++;
    } else {
      early++;
    }
  }
  
  return { mandatory, new: newCount, early };
}

export function getTopicStatus(topic: Topic, targetDate: string): 'new' | 'mandatory' | 'early' | 'future' {
  if (isNewTopic(topic.lastReviewedAt)) {
    return 'new';
  }
  if (isReviewDue(topic.nextReviewAt, targetDate)) {
    return 'mandatory';
  }
  if (topic.nextReviewAt && topic.nextReviewAt > targetDate) {
    return 'early';
  }
  return 'future';
}
