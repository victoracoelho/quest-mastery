import { Subject } from '@/types';
import { getItem, setItem, generateId } from '@/lib/storage';

const SUBJECTS_KEY = 'subjects';

export function getAllSubjects(): Subject[] {
  return getItem<Subject[]>(SUBJECTS_KEY) || [];
}

export function getSubjectsByUser(userId: string): Subject[] {
  return getAllSubjects().filter(s => s.userId === userId && s.isActive);
}

export function getSubjectById(id: string): Subject | undefined {
  return getAllSubjects().find(s => s.id === id);
}

export function createSubject(userId: string, name: string): Subject {
  const subjects = getAllSubjects();
  const newSubject: Subject = {
    id: generateId(),
    userId,
    name,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  subjects.push(newSubject);
  setItem(SUBJECTS_KEY, subjects);
  return newSubject;
}

export function updateSubject(id: string, updates: Partial<Subject>): Subject | null {
  const subjects = getAllSubjects();
  const idx = subjects.findIndex(s => s.id === id);
  if (idx === -1) return null;
  
  subjects[idx] = { ...subjects[idx], ...updates };
  setItem(SUBJECTS_KEY, subjects);
  return subjects[idx];
}

export function deleteSubject(id: string, keepHistory: boolean = true): void {
  const subjects = getAllSubjects();
  if (keepHistory) {
    // Soft delete - just mark as inactive
    const idx = subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      subjects[idx].isActive = false;
      setItem(SUBJECTS_KEY, subjects);
    }
  } else {
    // Hard delete
    setItem(SUBJECTS_KEY, subjects.filter(s => s.id !== id));
  }
}
