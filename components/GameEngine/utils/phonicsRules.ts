import { Task } from '../../../types';

/**
 * Merges AI-generated tasks with local fallback tasks.
 * Ensures we always have a full quest of 5 tasks.
 */
export const mergeTasks = (local: Task[], ai: Task[]): Task[] => {
  if (!ai || ai.length === 0) return local;
  
  // Combine AI tasks and pad with local if AI returns fewer than 5
  const combined = [...ai];
  if (combined.length < 5) {
    combined.push(...local.slice(0, 5 - combined.length));
  }
  
  return combined.slice(0, 5);
};

export type { Task };
