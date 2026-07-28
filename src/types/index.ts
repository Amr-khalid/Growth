/**
 * Personal Growth OS — Core Type Definitions
 */

// ============ Enums & Unions ============

export type LifeCategory = 'work' | 'health' | 'relationships' | 'finance' | (string & {});

export interface CustomCategory {
  id: string;
  label: string;
  emoji: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export type HabitFrequency = 'daily' | 'weekly' | 'specific_days';

export type MoodTag = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

// ============ Data Models ============

export interface Habit {
  id: string;
  name: string;
  category: LifeCategory;
  frequency: HabitFrequency;
  specificDays?: number[];    // 0=Sun, 1=Mon, ..., 6=Sat (for specific_days frequency)
  createdAt: string;          // ISO date string
  isArchived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;        // ISO date (YYYY-MM-DD)
}

export interface Task {
  id: string;
  title: string;
  category: LifeCategory;
  isDailyMission: boolean;    // If true, shows on Dashboard
  isCompleted: boolean;
  dueDate: string;            // ISO date (YYYY-MM-DD)
  goalId?: string;            // Optional link to a weekly Goal
  createdAt: string;          // ISO timestamp
  completedAt?: string;       // ISO timestamp when completed
  requireProof?: boolean;
  proofImageUri?: string;
  proofAudioUri?: string;
  proofFileUri?: string;
  proofNote?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: LifeCategory;
  targetValue: number;
  currentValue: number;
  unit: string;               // e.g. "pages", "sessions", "km"
  weekStartDate: string;      // ISO date of the week's Monday
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  mood?: MoodTag;
  date: string;               // ISO date (YYYY-MM-DD)
  createdAt: string;
}

// ============ UI / Computed Types ============

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  completions: string[];      // Array of date strings (YYYY-MM-DD)
}

export interface CategoryProgress {
  category: LifeCategory;
  completedTasks: number;
  totalTasks: number;
  completedHabits: number;
  totalHabits: number;
  percentage: number;          // 0-100
}

export interface WeeklyReview {
  weekStartDate: string;
  taskCompletionRate: number;  // 0-100
  avgStreakLength: number;
  categoryBreakdown: CategoryProgress[];
  totalTasksCompleted: number;
  totalTasksCreated: number;
}
 // TypeScript interface expansion
