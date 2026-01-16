/**
 * Plan Generator Service (Async version using Supabase)
 */

import { getTopicsByUser } from '@/repositories/supabaseTopicRepository';
import { getSubjectsByUser } from '@/repositories/supabaseSubjectRepository';
import { getDailyPlanByDate, createDailyPlan, DailyPlan } from '@/repositories/supabaseDailyPlanRepository';
import { isReviewDue, isNewTopic } from './scheduler';
import { Topic } from '@/repositories/supabaseTopicRepository';

export interface PlanGenerationResult {
  plan: DailyPlan;
  isNew: boolean;
  stats: {
    mandatory: number;
    new: number;
    early: number;
  };
}

export async function generateDailyPlanAsync(userId: string, dateISO: string, cardsPorDia: number): Promise<PlanGenerationResult> {
  // Check if plan already exists for this date
  const existingPlan = await getDailyPlanByDate(userId, dateISO);
  if (existingPlan) {
    const stats = await calculatePlanStatsAsync(existingPlan.topic_ids_selected, dateISO, userId);
    return {
      plan: existingPlan,
      isNew: false,
      stats,
    };
  }
  
  const allTopics = await getTopicsByUser(userId);
  const activeSubjects = await getSubjectsByUser(userId);
  const activeSubjectIds = new Set(activeSubjects.map(s => s.id));
  
  // Filter only topics from active subjects
  const availableTopics = allTopics.filter(t => activeSubjectIds.has(t.subject_id));
  
  if (availableTopics.length === 0) {
    const emptyPlan = await createDailyPlan(userId, dateISO, []);
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
    const nextReviewAt = topic.next_review_at ? topic.next_review_at.split('T')[0] : null;
    if (isReviewDue(nextReviewAt, dateISO)) {
      mandatoryTopics.push(topic);
    } else if (isNewTopic(topic.last_reviewed_at)) {
      newTopics.push(topic);
    } else if (topic.next_review_at) {
      futureTopics.push(topic);
    }
  }
  
  // Sort future topics by nearest review date
  futureTopics.sort((a, b) => {
    if (!a.next_review_at) return 1;
    if (!b.next_review_at) return -1;
    return a.next_review_at.localeCompare(b.next_review_at);
  });
  
  // Stats tracking
  let mandatoryCount = 0;
  let newCount = 0;
  let earlyCount = 0;
  
  // Helper function to select topic with diversity preference
  const selectWithDiversity = (topics: Topic[]): Topic | null => {
    const diverseTopic = topics.find(t => !usedSubjectIds.has(t.subject_id));
    if (diverseTopic) return diverseTopic;
    return topics[0] || null;
  };
  
  // Priority 1: Mandatory reviews
  for (const topic of mandatoryTopics) {
    if (selectedTopicIds.length >= cardsPorDia) break;
    if (!selectedTopicIds.includes(topic.id)) {
      selectedTopicIds.push(topic.id);
      usedSubjectIds.add(topic.subject_id);
      mandatoryCount++;
    }
  }
  
  // Priority 2: New topics
  const remainingNew = [...newTopics];
  while (selectedTopicIds.length < cardsPorDia && remainingNew.length > 0) {
    const remaining = remainingNew.filter(t => !selectedTopicIds.includes(t.id));
    const selected = selectWithDiversity(remaining);
    if (!selected) break;
    
    selectedTopicIds.push(selected.id);
    usedSubjectIds.add(selected.subject_id);
    newCount++;
    remainingNew.splice(remainingNew.indexOf(selected), 1);
  }
  
  // Priority 3: Future reviews
  const remainingFuture = [...futureTopics];
  while (selectedTopicIds.length < cardsPorDia && remainingFuture.length > 0) {
    const remaining = remainingFuture.filter(t => !selectedTopicIds.includes(t.id));
    const selected = selectWithDiversity(remaining);
    if (!selected) break;
    
    selectedTopicIds.push(selected.id);
    usedSubjectIds.add(selected.subject_id);
    earlyCount++;
    remainingFuture.splice(remainingFuture.indexOf(selected), 1);
  }
  
  const newPlan = await createDailyPlan(userId, dateISO, selectedTopicIds);
  
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

async function calculatePlanStatsAsync(topicIds: string[], dateISO: string, userId: string): Promise<{ mandatory: number; new: number; early: number }> {
  const allTopics = await getTopicsByUser(userId);
  let mandatory = 0;
  let newCount = 0;
  let early = 0;
  
  for (const topicId of topicIds) {
    const topic = allTopics.find(t => t.id === topicId);
    if (!topic) continue;
    
    const nextReviewAt = topic.next_review_at ? topic.next_review_at.split('T')[0] : null;
    if (isReviewDue(nextReviewAt, dateISO)) {
      mandatory++;
    } else if (isNewTopic(topic.last_reviewed_at)) {
      newCount++;
    } else {
      early++;
    }
  }
  
  return { mandatory, new: newCount, early };
}

export function getTopicStatusFromDb(topic: Topic, targetDate: string): 'new' | 'mandatory' | 'early' | 'future' {
  const nextReviewAt = topic.next_review_at ? topic.next_review_at.split('T')[0] : null;
  
  if (isNewTopic(topic.last_reviewed_at)) {
    return 'new';
  }
  if (isReviewDue(nextReviewAt, targetDate)) {
    return 'mandatory';
  }
  if (nextReviewAt && nextReviewAt > targetDate) {
    return 'early';
  }
  return 'future';
}
