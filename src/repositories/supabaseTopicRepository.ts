import { supabase } from '@/integrations/supabase/client';

export interface Topic {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  notes: string;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  total_reviews: number;
  last_score_percent: number | null;
  created_at: string;
  updated_at: string;
}

export async function getTopicsByUser(userId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }

  return data || [];
}

export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching topics by subject:', error);
    throw error;
  }

  return data || [];
}

export async function getTopicById(id: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching topic:', error);
    throw error;
  }

  return data;
}

export async function createTopic(userId: string, subjectId: string, title: string): Promise<Topic> {
  const { data, error } = await supabase
    .from('topics')
    .insert({
      user_id: userId,
      subject_id: subjectId,
      title,
      notes: '',
      total_reviews: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating topic:', error);
    throw error;
  }

  return data;
}

export async function createTopicsBatch(userId: string, subjectId: string, titles: string[]): Promise<Topic[]> {
  const topicsToInsert = titles.map(title => ({
    user_id: userId,
    subject_id: subjectId,
    title: title.trim(),
    notes: '',
    total_reviews: 0,
  }));

  const { data, error } = await supabase
    .from('topics')
    .insert(topicsToInsert)
    .select();

  if (error) {
    console.error('Error creating topics batch:', error);
    throw error;
  }

  return data || [];
}

export async function updateTopic(id: string, updates: Partial<Omit<Topic, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('topics')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating topic:', error);
    throw error;
  }

  return data;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting topic:', error);
    throw error;
  }
}

export async function deleteTopicsBySubject(subjectId: string): Promise<void> {
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('subject_id', subjectId);

  if (error) {
    console.error('Error deleting topics by subject:', error);
    throw error;
  }
}
