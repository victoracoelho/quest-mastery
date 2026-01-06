import { DailyPlan } from '@/types';
import { getItem, setItem, generateId } from '@/lib/storage';

const DAILY_PLANS_KEY = 'daily_plans';

export function getAllDailyPlans(): DailyPlan[] {
  return getItem<DailyPlan[]>(DAILY_PLANS_KEY) || [];
}

export function getDailyPlansByUser(userId: string): DailyPlan[] {
  return getAllDailyPlans()
    .filter(p => p.userId === userId)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

export function getDailyPlanByDate(userId: string, dateISO: string): DailyPlan | undefined {
  return getAllDailyPlans().find(p => p.userId === userId && p.dateISO === dateISO);
}

export function createDailyPlan(userId: string, dateISO: string, topicIds: string[]): DailyPlan {
  const plans = getAllDailyPlans();
  const now = new Date().toISOString();
  const newPlan: DailyPlan = {
    id: generateId(),
    userId,
    dateISO,
    topicIdsSelected: topicIds,
    topicIdsCompleted: [],
    createdAt: now,
    updatedAt: now,
  };
  plans.push(newPlan);
  setItem(DAILY_PLANS_KEY, plans);
  return newPlan;
}

export function updateDailyPlan(id: string, updates: Partial<DailyPlan>): DailyPlan | null {
  const plans = getAllDailyPlans();
  const idx = plans.findIndex(p => p.id === id);
  if (idx === -1) return null;
  
  plans[idx] = { 
    ...plans[idx], 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  setItem(DAILY_PLANS_KEY, plans);
  return plans[idx];
}

export function markTopicCompleted(planId: string, topicId: string): DailyPlan | null {
  const plans = getAllDailyPlans();
  const idx = plans.findIndex(p => p.id === planId);
  if (idx === -1) return null;
  
  if (!plans[idx].topicIdsCompleted.includes(topicId)) {
    plans[idx].topicIdsCompleted.push(topicId);
    plans[idx].updatedAt = new Date().toISOString();
    setItem(DAILY_PLANS_KEY, plans);
  }
  return plans[idx];
}

export function unmarkTopicCompleted(planId: string, topicId: string): DailyPlan | null {
  const plans = getAllDailyPlans();
  const idx = plans.findIndex(p => p.id === planId);
  if (idx === -1) return null;
  
  plans[idx].topicIdsCompleted = plans[idx].topicIdsCompleted.filter(id => id !== topicId);
  plans[idx].updatedAt = new Date().toISOString();
  setItem(DAILY_PLANS_KEY, plans);
  return plans[idx];
}
