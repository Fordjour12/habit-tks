import { HabitCompletion } from '../types/habit';

export class AnalyticsService {
	private analytics: Map<string, any> = new Map();

	async trackCompletion(completion: HabitCompletion): Promise<void> {
		const key = `completion_${completion.userId}_${completion.habitId}`;
		const existing = this.analytics.get(key) || { count: 0, lastCompleted: null };

		existing.count += 1;
		existing.lastCompleted = completion.completedAt;
		existing.streak = await this.calculateStreak(completion.userId, completion.habitId);

		this.analytics.set(key, existing);

		console.log(`Tracked completion for habit ${completion.habitId} by user ${completion.userId}`);
	}

	async trackSkip(completion: HabitCompletion): Promise<void> {
		const key = `skip_${completion.userId}_${completion.habitId}`;
		const existing = this.analytics.get(key) || { count: 0, lastSkipped: null };

		existing.count += 1;
		existing.lastSkipped = completion.completedAt;

		this.analytics.set(key, existing);

		console.log(`Tracked skip for habit ${completion.habitId} by user ${completion.userId}`);
	}

	async logPenalty(userId: string, tier: string): Promise<void> {
		const key = `penalty_${userId}`;
		const existing = this.analytics.get(key) || { count: 0, lastPenalty: null, tier };

		existing.count += 1;
		existing.lastPenalty = new Date();
		existing.tier = tier;

		this.analytics.set(key, existing);

		console.log(`Logged penalty for user ${userId} at tier ${tier}`);
	}

	async getUserStats(userId: string): Promise<any> {
		const userAnalytics = Array.from(this.analytics.entries())
			.filter(([key]) => key.startsWith(`completion_${userId}_`))
			.map(([key, value]) => ({
				habitId: key.split('_')[2],
				...value
			}));

		const totalCompletions = userAnalytics.reduce((sum, stat) => sum + stat.count, 0);
		const totalHabits = userAnalytics.length;
		const averageStreak = userAnalytics.length > 0
			? userAnalytics.reduce((sum, stat) => sum + stat.streak, 0) / userAnalytics.length
			: 0;

		return {
			totalCompletions,
			totalHabits,
			averageStreak: Math.round(averageStreak * 100) / 100,
			habits: userAnalytics
		};
	}

	async getHabitStats(habitId: string): Promise<any> {
		const habitAnalytics = Array.from(this.analytics.entries())
			.filter(([key]) => key.includes(`_${habitId}`))
			.map(([key, value]) => ({
				type: key.startsWith('completion_') ? 'completion' : 'skip',
				...value
			}));

		const completions = habitAnalytics.filter(stat => stat.type === 'completion');
		const skips = habitAnalytics.filter(stat => stat.type === 'skip');

		return {
			totalCompletions: completions.reduce((sum, stat) => sum + stat.count, 0),
			totalSkips: skips.reduce((sum, stat) => sum + stat.count, 0),
			completionRate: completions.length > 0
				? (completions[0].count / (completions[0].count + (skips[0]?.count || 0))) * 100
				: 0
		};
	}

	private async calculateStreak(userId: string, habitId: string): Promise<number> {
		// Mock implementation - in real app, this would calculate actual streak
		return Math.floor(Math.random() * 30) + 1; // Random number 1-30
	}
}
