import { BASELINE_HABITS, TIER2_HABITS, TIER3_HABITS } from '../data/defaultHabits';
import { HabitService } from './HabitService';
import { ProgressionService } from './ProgressionService';
import { UserService } from './UserService';
import { webSocketService } from './WebSocketService';

export class SetupService {
	constructor(
		private habitService: HabitService,
		private progressionService: ProgressionService,
		private userService: UserService
	) { }

	async setupUserAccount(userId: string): Promise<{
		baselineHabits: string[];
		tier2UnlockDate: Date;
		message: string;
	}> {
		try {
			// Create baseline habits
			const baselineHabits = await this.createBaselineHabits(userId);

			// Create tier2 habits (inactive initially)
			await this.createTier2Habits(userId);

			// Create tier3 habits (inactive initially)
			await this.createTier3Habits(userId);

			// Initialize progression rules
			await this.progressionService.initializeUserProgression(userId);

			// Set user to baseline tier
			await this.userService.updateUserTier(userId, 'baseline');

			const tier2UnlockDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

			return {
				baselineHabits: baselineHabits.map(h => h.id),
				tier2UnlockDate,
				message: 'Account setup complete! You now have 4 baseline habits to start with.'
			};
		} catch (error) {
			throw new Error(`Failed to setup user account: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async resetUserAccount(userId: string): Promise<{ message: string }> {
		try {
			// Archive all existing habits
			await this.habitService.archiveHabits(userId, 'baseline');
			await this.habitService.archiveHabits(userId, 'tier2');
			await this.habitService.archiveHabits(userId, 'tier3');

			// Reset user to baseline
			await this.userService.updateUserTier(userId, 'baseline');

			// Setup fresh account
			await this.setupUserAccount(userId);

			return {
				message: 'Account reset complete! You have a fresh start with baseline habits.'
			};
		} catch (error) {
			throw new Error(`Failed to reset user account: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async unlockTier2(userId: string): Promise<{ message: string }> {
		try {
			// Archive baseline habits
			await this.habitService.archiveHabits(userId, 'baseline');

			// Activate tier2 habits
			await this.habitService.activateTierHabits(userId, 'tier2');

			// Update user tier
			await this.userService.updateUserTier(userId, 'tier2');

			// Send real-time notification
			webSocketService.notifyTierUnlocked(userId, {
				tier: 'tier2',
				unlockedAt: new Date(),
				message: 'Congratulations! You\'ve unlocked Tier 2 habits. Keep up the momentum!'
			});

			return {
				message: 'Congratulations! You\'ve unlocked Tier 2 habits. Keep up the momentum!'
			};
		} catch (error) {
			throw new Error(`Failed to unlock tier2: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async unlockTier3(userId: string): Promise<{ message: string }> {
		try {
			// Archive tier2 habits
			await this.habitService.archiveHabits(userId, 'tier2');

			// Activate tier3 habits
			await this.habitService.activateTierHabits(userId, 'tier3');

			// Update user tier
			await this.userService.updateUserTier(userId, 'tier3');

			// Send real-time notification
			webSocketService.notifyTierUnlocked(userId, {
				tier: 'tier3',
				unlockedAt: new Date(),
				message: 'Amazing! You\'ve reached Tier 3. You\'re now operating at peak performance!'
			});

			return {
				message: 'Amazing! You\'ve reached Tier 3. You\'re now operating at peak performance!'
			};
		} catch (error) {
			throw new Error(`Failed to unlock tier3: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	private async createBaselineHabits(userId: string): Promise<any[]> {
		const createdHabits = [];
		for (const habitTemplate of BASELINE_HABITS) {
			const habit = await this.habitService.createHabit({
				userId,
				name: habitTemplate.name,
				description: habitTemplate.description,
				category: habitTemplate.category,
				tier: habitTemplate.tier,
				frequency: habitTemplate.frequency,
				reminderTime: habitTemplate.reminderTime,
				notes: habitTemplate.notes,
				priority: habitTemplate.priority,
				streakTracking: habitTemplate.streakTracking,
				skipAllowed: habitTemplate.skipAllowed,
				startDate: habitTemplate.startDate.toISOString()
			});
			createdHabits.push(habit);
		}
		return createdHabits;
	}

	private async createTier2Habits(userId: string): Promise<void> {
		for (const habitTemplate of TIER2_HABITS) {
			await this.habitService.createHabit({
				userId,
				name: habitTemplate.name,
				description: habitTemplate.description,
				category: habitTemplate.category,
				tier: habitTemplate.tier,
				frequency: habitTemplate.frequency,
				reminderTime: habitTemplate.reminderTime,
				notes: habitTemplate.notes,
				priority: habitTemplate.priority,
				streakTracking: habitTemplate.streakTracking,
				skipAllowed: habitTemplate.skipAllowed,
				startDate: habitTemplate.startDate.toISOString()
			});
		}
	}

	private async createTier3Habits(userId: string): Promise<void> {
		for (const habitTemplate of TIER3_HABITS) {
			await this.habitService.createHabit({
				userId,
				name: habitTemplate.name,
				description: habitTemplate.description,
				category: habitTemplate.category,
				tier: habitTemplate.tier,
				frequency: habitTemplate.frequency,
				reminderTime: habitTemplate.reminderTime,
				notes: habitTemplate.notes,
				priority: habitTemplate.priority,
				streakTracking: habitTemplate.streakTracking,
				skipAllowed: habitTemplate.skipAllowed,
				startDate: habitTemplate.startDate.toISOString()
			});
		}
	}
}
