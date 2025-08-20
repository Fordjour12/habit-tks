import { HabitTier } from '../types/habit';

export const BASELINE_HABITS = [
	{
		name: '5 push-ups',
		description: 'Even if exhausted',
		category: 'fitness' as const,
		tier: 'baseline' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '07:00',
		notes: 'Even if exhausted',
		priority: 'high' as const,
		streakTracking: true,
		skipAllowed: false,
		startDate: new Date(),
		isActive: true,
		archived: false
	},
	{
		name: 'Open IDE + git pull',
		description: 'Just glance at code',
		category: 'work' as const,
		tier: 'baseline' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '09:00',
		notes: 'Just glance at code',
		priority: 'high' as const,
		streakTracking: true,
		skipAllowed: false,
		startDate: new Date(),
		isActive: true,
		archived: false
	},
	{
		name: 'Read 1 page',
		description: 'Book or docs',
		category: 'learning' as const,
		tier: 'baseline' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '20:00',
		notes: 'Book or docs',
		priority: 'high' as const,
		streakTracking: true,
		skipAllowed: false,
		startDate: new Date(),
		isActive: true,
		archived: false
	},
	{
		name: 'Write 1 MIT task',
		description: 'Tomorrow\'s top task',
		category: 'productivity' as const,
		tier: 'baseline' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '22:00',
		notes: 'Tomorrow\'s top task',
		priority: 'high' as const,
		streakTracking: true,
		skipAllowed: false,
		startDate: new Date(),
		isActive: true,
		archived: false
	}
];

export const TIER2_HABITS = [
	{
		name: '15-min workout',
		description: 'Kettlebell/run',
		category: 'fitness' as const,
		tier: 'tier2' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '06:30',
		notes: 'Kettlebell/run',
		priority: 'high' as const,
		streakTracking: true,
		skipAllowed: false,
		startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
		isActive: false,
		archived: false
	},
	{
		name: 'Ship 1 task',
		description: 'Bug fix/PR',
		category: 'work' as const,
		tier: 'tier2' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '11:00',
		notes: 'Bug fix/PR',
		priority: 'high' as const,
		streakTracking: true,
		skipAllowed: false,
		startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		isActive: false,
		archived: false
	},
	{
		name: 'Study 30 min',
		description: 'New skill or concept',
		category: 'learning' as const,
		tier: 'tier2' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '19:00',
		notes: 'New skill or concept',
		priority: 'medium' as const,
		streakTracking: true,
		skipAllowed: true,
		startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		isActive: false,
		archived: false
	},
	{
		name: 'Plan next day',
		description: 'Review and prioritize',
		category: 'productivity' as const,
		tier: 'tier2' as HabitTier,
		frequency: 'daily' as const,
		reminderTime: '21:00',
		notes: 'Review and prioritize',
		priority: 'medium' as const,
		streakTracking: true,
		skipAllowed: true,
		startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		isActive: false,
		archived: false
	}
];

export const TIER3_HABITS = [
	{
		name: '45-min gym',
		description: 'Only when energized',
		category: 'fitness' as const,
		tier: 'tier3' as HabitTier,
		frequency: 'custom' as const,
		reminderTime: undefined,
		notes: 'Only when energized',
		priority: 'medium' as const,
		streakTracking: false,
		skipAllowed: true,
		startDate: new Date(),
		isActive: false,
		archived: false
	},
	{
		name: 'Deep work session',
		description: '2+ hours focused work',
		category: 'work' as const,
		tier: 'tier3' as HabitTier,
		frequency: 'weekly' as const,
		reminderTime: '10:00',
		notes: '2+ hours focused work',
		priority: 'medium' as const,
		streakTracking: false,
		skipAllowed: true,
		startDate: new Date(),
		isActive: false,
		archived: false
	},
	{
		name: 'Teach someone',
		description: 'Share knowledge',
		category: 'learning' as const,
		tier: 'tier3' as HabitTier,
		frequency: 'weekly' as const,
		reminderTime: '15:00',
		notes: 'Share knowledge',
		priority: 'low' as const,
		streakTracking: false,
		skipAllowed: true,
		startDate: new Date(),
		isActive: false,
		archived: false
	},
	{
		name: 'Weekly review',
		description: 'Reflect and adjust',
		category: 'productivity' as const,
		tier: 'tier3' as HabitTier,
		frequency: 'weekly' as const,
		reminderTime: '16:00',
		notes: 'Reflect and adjust',
		priority: 'low' as const,
		streakTracking: false,
		skipAllowed: true,
		startDate: new Date(),
		isActive: false,
		archived: false
	}
];
