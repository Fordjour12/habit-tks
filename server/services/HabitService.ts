import { Habit, HabitCompletion, HabitTier, CreateHabitRequest, CompleteHabitRequest, SkipHabitRequest } from '../types/habit';
import { ProgressionService } from './ProgressionService';
import { AnalyticsService } from './AnalyticsService';
import { webSocketService } from './WebSocketService';

export class HabitService {
	private habits: Map<string, Habit> = new Map();
	private completions: Map<string, HabitCompletion> = new Map();

	constructor(
		private progressionService: ProgressionService,
		private analyticsService: AnalyticsService
	) { }

	async createHabit(habitData: CreateHabitRequest): Promise<Habit> {
		const habit: Habit = {
			...habitData,
			id: this.generateId(),
			startDate: new Date(habitData.startDate),
			createdAt: new Date(),
			updatedAt: new Date(),
			archived: false,
			isActive: new Date(habitData.startDate) <= new Date()
		};

		this.habits.set(habit.id, habit);
		return habit;
	}

	async completeHabit(habitId: string, userId: string, data: CompleteHabitRequest): Promise<HabitCompletion> {
		const habit = await this.getHabit(habitId);
		if (!habit || habit.userId !== userId) {
			throw new Error('Habit not found or access denied');
		}

		const completion: HabitCompletion = {
			id: this.generateCompletionId(),
			habitId,
			userId,
			completedAt: new Date(),
			notes: data.notes,
			wasSkipped: false,
			tier: habit.tier,
			metrics: data.metrics
		};

		this.completions.set(completion.id, completion);

		// Check for progression
		await this.progressionService.checkProgression(userId, habit.tier);

		// Update analytics
		await this.analyticsService.trackCompletion(completion);

		// Send real-time notification
		webSocketService.notifyHabitCompleted(userId, {
			habitId: habit.id,
			habitName: habit.name,
			tier: habit.tier,
			completionId: completion.id,
			completedAt: completion.completedAt
		});

		return completion;
	}

	async skipHabit(habitId: string, userId: string, data: SkipHabitRequest): Promise<void> {
		const habit = await this.getHabit(habitId);
		if (!habit || habit.userId !== userId) {
			throw new Error('Habit not found or access denied');
		}

		if (!habit.skipAllowed) {
			throw new Error(`Cannot skip habit: ${habit.name} (skip not allowed)`);
		}

		const skipCompletion: HabitCompletion = {
			id: this.generateCompletionId(),
			habitId,
			userId,
			completedAt: new Date(),
			notes: `SKIPPED: ${data.reason}`,
			wasSkipped: true,
			tier: habit.tier
		};

		this.completions.set(skipCompletion.id, skipCompletion);
		await this.analyticsService.trackSkip(skipCompletion);

		// Send real-time notification
		webSocketService.notifyHabitSkipped(userId, {
			habitId: habit.id,
			habitName: habit.name,
			tier: habit.tier,
			skipId: skipCompletion.id,
			reason: data.reason,
			skippedAt: skipCompletion.completedAt
		});

		// Check for penalties
		await this.progressionService.checkPenalties(userId);
	}

	async getHabitsByTier(userId: string, tier: HabitTier): Promise<Habit[]> {
		return Array.from(this.habits.values()).filter(
			habit => habit.userId === userId && habit.tier === tier
		);
	}

	async getBaselineHabits(userId: string): Promise<Habit[]> {
		return this.getHabitsByTier(userId, 'baseline');
	}

	async getTier2Habits(userId: string): Promise<Habit[]> {
		return this.getHabitsByTier(userId, 'tier2');
	}

	async getTier3Habits(userId: string): Promise<Habit[]> {
		return this.getHabitsByTier(userId, 'tier3');
	}

	async getAllActiveHabits(userId: string): Promise<Habit[]> {
		return Array.from(this.habits.values()).filter(
			habit => habit.userId === userId && habit.isActive && !habit.archived
		);
	}

	async archiveHabits(userId: string, tier: HabitTier): Promise<void> {
		const habits = await this.getHabitsByTier(userId, tier);
		for (const habit of habits) {
			habit.archived = true;
			habit.isActive = false;
			habit.updatedAt = new Date();
			this.habits.set(habit.id, habit);
		}
	}

	async activateTierHabits(userId: string, tier: HabitTier): Promise<void> {
		const habits = await this.getHabitsByTier(userId, tier);
		for (const habit of habits) {
			habit.isActive = true;
			habit.archived = false;
			habit.updatedAt = new Date();
			this.habits.set(habit.id, habit);
		}
	}

	async getHabit(habitId: string): Promise<Habit | null> {
		return this.habits.get(habitId) || null;
	}

	async updateHabit(habitId: string, userId: string, updates: Partial<Habit>): Promise<Habit> {
		const habit = await this.getHabit(habitId);
		if (!habit || habit.userId !== userId) {
			throw new Error('Habit not found or access denied');
		}

		const updatedHabit = { ...habit, ...updates, updatedAt: new Date() };
		this.habits.set(habitId, updatedHabit);
		return updatedHabit;
	}

	async deleteHabit(habitId: string, userId: string): Promise<void> {
		const habit = await this.getHabit(habitId);
		if (!habit || habit.userId !== userId) {
			throw new Error('Habit not found or access denied');
		}

		this.habits.delete(habitId);
	}

	private generateId(): string {
		return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateCompletionId(): string {
		return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
