import { HabitTier } from '../types/habit';
import { ProgressionRule, ProgressionCondition, ProgressionEvent } from '../types/progression';

export class ProgressionService {
	private progressionRules: Map<string, ProgressionRule[]> = new Map();
	private progressionEvents: Map<string, ProgressionEvent> = new Map();

	async initializeUserProgression(userId: string): Promise<void> {
		const rules = this.getDefaultProgressionRules(userId);
		this.progressionRules.set(userId, rules);
	}

	async checkProgression(userId: string, completedTier: HabitTier): Promise<void> {
		const rules = this.progressionRules.get(userId) || [];
		const relevantRules = rules.filter(rule => rule.fromTier === completedTier);

		for (const rule of relevantRules) {
			if (await this.checkCondition(userId, rule.condition)) {
				await this.applyProgression(userId, rule);
			}
		}
	}

	async checkPenalties(userId: string): Promise<void> {
		const recentSkips = await this.getRecentSkips(userId, 7); // Last 7 days
		if (recentSkips >= 3) {
			await this.applyPenalty(userId);
		}
	}

	async getProgressionRules(userId: string): Promise<ProgressionRule[]> {
		return this.progressionRules.get(userId) || [];
	}

	async addProgressionRule(userId: string, rule: Omit<ProgressionRule, 'id'>): Promise<ProgressionRule> {
		const newRule: ProgressionRule = {
			...rule,
			id: this.generateRuleId()
		};

		const userRules = this.progressionRules.get(userId) || [];
		userRules.push(newRule);
		this.progressionRules.set(userId, userRules);

		return newRule;
	}

	async getProgressionHistory(userId: string): Promise<ProgressionEvent[]> {
		return Array.from(this.progressionEvents.values()).filter(
			event => event.userId === userId
		);
	}

	private async checkCondition(userId: string, condition: ProgressionCondition): Promise<boolean> {
		switch (condition.type) {
			case 'consecutiveDays':
				const streak = await this.getConsecutiveDays(userId, condition.timeframe || 7);
				return streak >= condition.value;

			case 'weeklyFrequency':
				const completions = await this.getWeeklyCompletions(userId);
				return completions >= condition.value;

			case 'manual':
				return false; // Manual progression handled separately

			default:
				return false;
		}
	}

	private async applyProgression(userId: string, rule: ProgressionRule): Promise<void> {
		// Create progression event
		const event: ProgressionEvent = {
			id: this.generateEventId(),
			userId,
			fromTier: rule.fromTier,
			toTier: rule.toTier,
			triggeredAt: new Date(),
			condition: rule.condition,
			wasPenalty: false
		};

		this.progressionEvents.set(event.id, event);

		// Note: In a real implementation, you would call the HabitService here
		// For now, we'll just log the progression
		console.log(`User ${userId} progressed from ${rule.fromTier} to ${rule.toTier}`);
	}

	private async applyPenalty(userId: string): Promise<void> {
		// Create penalty event
		const event: ProgressionEvent = {
			id: this.generateEventId(),
			userId,
			fromTier: 'tier2', // Assuming penalty from tier2
			toTier: 'baseline',
			triggeredAt: new Date(),
			condition: {
				type: 'consecutiveDays',
				value: 3,
				timeframe: 7
			},
			wasPenalty: true
		};

		this.progressionEvents.set(event.id, event);

		console.log(`User ${userId} received penalty: downgraded to baseline`);
	}

	private getDefaultProgressionRules(userId: string): ProgressionRule[] {
		return [
			{
				id: `rule_${userId}_baseline_tier2`,
				userId,
				fromTier: 'baseline',
				toTier: 'tier2',
				condition: {
					type: 'consecutiveDays',
					value: 7,
					timeframe: 7
				}
			},
			{
				id: `rule_${userId}_tier2_tier3`,
				userId,
				fromTier: 'tier2',
				toTier: 'tier3',
				condition: {
					type: 'weeklyFrequency',
					value: 5,
					timeframe: 7
				}
			}
		];
	}

	// Helper methods with mock implementations
	private async getConsecutiveDays(userId: string, days: number): Promise<number> {
		// Mock implementation - in real app, this would query the database
		return Math.floor(Math.random() * 10) + 1; // Random number 1-10
	}

	private async getWeeklyCompletions(userId: string): Promise<number> {
		// Mock implementation - in real app, this would query the database
		return Math.floor(Math.random() * 7) + 1; // Random number 1-7
	}

	private async getRecentSkips(userId: string, days: number): Promise<number> {
		// Mock implementation - in real app, this would query the database
		return Math.floor(Math.random() * 5); // Random number 0-4
	}

	private generateRuleId(): string {
		return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateEventId(): string {
		return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
