import { supabase } from '@/integrations/supabase/client';

export interface DailyPlan {
  id: string;
  user_id: string;
  date_iso: string;
  topic_ids_selected: string[];
  topic_ids_completed: string[];
  created_at: string;
  updated_at: string;
}

export async function getDailyPlansByUser(userId: string): Promise<DailyPlan[]> {
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .order('date_iso', { ascending: false });

  if (error) {
    console.error('Error fetching daily plans:', error);
    throw error;
  }

  return data || [];
}

export async function getDailyPlanByDate(userId: string, dateISO: string): Promise<DailyPlan | null> {
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date_iso', dateISO)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching daily plan:', error);
    throw error;
  }

  return data;
}

export async function createDailyPlan(userId: string, dateISO: string, topicIds: string[]): Promise<DailyPlan> {
  const { data, error } = await supabase
    .from('daily_plans')
    .insert({
      user_id: userId,
      date_iso: dateISO,
      topic_ids_selected: topicIds,
      topic_ids_completed: [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating daily plan:', error);
    throw error;
  }

  return data;
}

export async function updateDailyPlan(id: string, updates: Partial<Pick<DailyPlan, 'topic_ids_selected' | 'topic_ids_completed'>>): Promise<DailyPlan | null> {
  const { data, error } = await supabase
    .from('daily_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating daily plan:', error);
    throw error;
  }

  return data;
}

export async function markTopicCompleted(planId: string, topicId: string): Promise<DailyPlan | null> {
  // First get the current plan
  const { data: plan, error: fetchError } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (fetchError || !plan) {
    console.error('Error fetching plan for update:', fetchError);
    return null;
  }

  const currentCompleted = plan.topic_ids_completed || [];
  if (currentCompleted.includes(topicId)) {
    return plan;
  }

  const updatedCompleted = [...currentCompleted, topicId];

  const { data, error } = await supabase
    .from('daily_plans')
    .update({ topic_ids_completed: updatedCompleted })
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error marking topic completed:', error);
    throw error;
  }

  return data;
}

export async function unmarkTopicCompleted(planId: string, topicId: string): Promise<DailyPlan | null> {
  // First get the current plan
  const { data: plan, error: fetchError } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (fetchError || !plan) {
    console.error('Error fetching plan for update:', fetchError);
    return null;
  }

  const currentCompleted = plan.topic_ids_completed || [];
  const updatedCompleted = currentCompleted.filter((id: string) => id !== topicId);

  const { data, error } = await supabase
    .from('daily_plans')
    .update({ topic_ids_completed: updatedCompleted })
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error unmarking topic completed:', error);
    throw error;
  }

  return data;
}

export async function upsertDailyPlan(userId: string, dateISO: string, topicIds: string[]): Promise<DailyPlan> {
  // Check if plan exists
  const existing = await getDailyPlanByDate(userId, dateISO);
  
  if (existing) {
    const updated = await updateDailyPlan(existing.id, { topic_ids_selected: topicIds });
    return updated!;
  }
  
  return createDailyPlan(userId, dateISO, topicIds);
}
