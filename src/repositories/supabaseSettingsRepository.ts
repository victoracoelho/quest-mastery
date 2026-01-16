import { supabase } from '@/integrations/supabase/client';

export interface UserSettings {
  id: string;
  user_id: string;
  cards_per_day: number;
  questions_per_topic: number;
  created_at: string;
  updated_at: string;
}

export async function getSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching settings:', error);
    throw error;
  }

  return data;
}

export async function createSettings(userId: string, cardsPerDay: number = 10): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
      cards_per_day: cardsPerDay,
      questions_per_topic: 10,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating settings:', error);
    throw error;
  }

  return data;
}

export async function updateSettings(userId: string, updates: Partial<Pick<UserSettings, 'cards_per_day' | 'questions_per_topic'>>): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }

  return data;
}

export async function getOrCreateSettings(userId: string): Promise<UserSettings> {
  const existing = await getSettings(userId);
  if (existing) return existing;
  return createSettings(userId);
}
