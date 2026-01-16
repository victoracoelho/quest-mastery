import { supabase } from '@/integrations/supabase/client';

export interface ReviewLog {
  id: string;
  user_id: string;
  topic_id: string;
  reviewed_at: string;
  correct_answers: number;
  score_percent: number;
  next_review_at_computed: string;
  review_note: string;
  created_at: string;
}

export async function getReviewLogsByUser(userId: string): Promise<ReviewLog[]> {
  const { data, error } = await supabase
    .from('review_logs')
    .select('*')
    .eq('user_id', userId)
    .order('reviewed_at', { ascending: false });

  if (error) {
    console.error('Error fetching review logs:', error);
    throw error;
  }

  return data || [];
}

export async function getReviewLogsByTopic(topicId: string): Promise<ReviewLog[]> {
  const { data, error } = await supabase
    .from('review_logs')
    .select('*')
    .eq('topic_id', topicId)
    .order('reviewed_at', { ascending: false });

  if (error) {
    console.error('Error fetching review logs by topic:', error);
    throw error;
  }

  return data || [];
}

export async function createReviewLog(
  userId: string,
  topicId: string,
  correctAnswers: number,
  scorePercent: number,
  nextReviewAtComputed: string,
  reviewNote: string
): Promise<ReviewLog> {
  const { data, error } = await supabase
    .from('review_logs')
    .insert({
      user_id: userId,
      topic_id: topicId,
      correct_answers: correctAnswers,
      score_percent: scorePercent,
      next_review_at_computed: nextReviewAtComputed,
      review_note: reviewNote || '',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review log:', error);
    throw error;
  }

  return data;
}

export async function deleteReviewLogsByTopic(topicId: string): Promise<void> {
  const { error } = await supabase
    .from('review_logs')
    .delete()
    .eq('topic_id', topicId);

  if (error) {
    console.error('Error deleting review logs:', error);
    throw error;
  }
}
