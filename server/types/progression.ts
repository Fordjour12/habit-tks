import { HabitTier } from './habit';

export interface ProgressionRule {
	id: string;
	userId: string;
	fromTier: HabitTier;
	toTier: HabitTier;
	condition: ProgressionCondition;
	penalty?: PenaltyRule;
}

export interface ProgressionCondition {
	type: 'consecutiveDays' | 'weeklyFrequency' | 'manual';
	value: number;
	timeframe?: number; // days
}

export interface PenaltyRule {
	type: 'downgrade' | 'additionalTask' | 'timeout';
	duration?: number; // days
	task?: string;
}

export interface ProgressionEvent {
	id: string;
	userId: string;
	fromTier: HabitTier;
	toTier: HabitTier;
	triggeredAt: Date;
	condition: ProgressionCondition;
	wasPenalty: boolean;
}
