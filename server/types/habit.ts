export interface Habit {
	id: string;
	userId: string;
	name: string;
	description: string;
	category: HabitCategory;
	tier: HabitTier;
	frequency: Frequency;
	reminderTime?: string;
	notes?: string;
	priority: Priority;
	streakTracking: boolean;
	skipAllowed: boolean;
	startDate: Date;
	isActive: boolean;
	archived: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface HabitCompletion {
	id: string;
	habitId: string;
	userId: string;
	completedAt: Date;
	notes?: string;
	wasSkipped: boolean;
	tier: HabitTier;
	metrics?: {
		duration?: number;
		intensity?: 'low' | 'medium' | 'high';
		additionalData?: Record<string, any>;
	};
}

export type HabitCategory = 'fitness' | 'work' | 'learning' | 'productivity';
export type HabitTier = 'baseline' | 'tier2' | 'tier3';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type Priority = 'low' | 'medium' | 'high';

export interface CreateHabitRequest {
	name: string;
	description: string;
	category: HabitCategory;
	tier: HabitTier;
	frequency: Frequency;
	reminderTime?: string;
	notes?: string;
	priority: Priority;
	streakTracking: boolean;
	skipAllowed: boolean;
	startDate: string;
}

export interface CompleteHabitRequest {
	notes?: string;
	metrics?: {
		duration?: number;
		intensity?: 'low' | 'medium' | 'high';
		additionalData?: Record<string, any>;
	};
}

export interface SkipHabitRequest {
	reason: string;
}
