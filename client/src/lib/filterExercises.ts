import type { Exercise } from './languagePacks';

export interface ExerciseFilters {
  track?: string;
  difficulty?: number;
  focus?: string;
  level?: string;
}

export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
  return exercises.filter(ex => {
    if (filters.track && ex.track !== filters.track) return false;
    if (filters.difficulty !== undefined && ex.difficulty !== filters.difficulty) return false;
    if (filters.focus && !ex.focus.includes(filters.focus)) return false;
    if (filters.level && ex.level !== filters.level) return false;
    return true;
  });
}
