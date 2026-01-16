import { supabase } from '@/integrations/supabase/client';

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getSubjectsByUser(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }

  return data || [];
}

export async function getAllSubjectsByUser(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all subjects:', error);
    throw error;
  }

  return data || [];
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching subject:', error);
    throw error;
  }

  return data;
}

export async function createSubject(userId: string, name: string): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert({
      user_id: userId,
      name,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subject:', error);
    throw error;
  }

  return data;
}

export async function updateSubject(id: string, updates: Partial<Pick<Subject, 'name' | 'is_active'>>): Promise<Subject | null> {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subject:', error);
    throw error;
  }

  return data;
}

export async function deleteSubject(id: string, keepHistory: boolean = true): Promise<void> {
  if (keepHistory) {
    // Soft delete - mark as inactive
    await updateSubject(id, { is_active: false });
  } else {
    // Hard delete
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }
}
