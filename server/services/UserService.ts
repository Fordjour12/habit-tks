import { User, CreateUserRequest, UpdateUserSettingsRequest } from '../types/user';
import { HabitTier } from '../types/habit';

export class UserService {
	private users: Map<string, User> = new Map();

	async createUser(userData: CreateUserRequest): Promise<User> {
		const user: User = {
			id: this.generateUserId(),
			email: userData.email,
			name: userData.name,
			currentTier: 'baseline',
			streak: 0,
			settings: {
				theme: 'light',
				notifications: true,
				strictMode: false,
				autoProgression: true
			},
			createdAt: new Date(),
			updatedAt: new Date()
		};

		this.users.set(user.id, user);
		return user;
	}

	async getUser(userId: string): Promise<User | null> {
		return this.users.get(userId) || null;
	}

	async getUserByEmail(email: string): Promise<User | null> {
		return Array.from(this.users.values()).find(user => user.email === email) || null;
	}

	async updateUser(userId: string, updates: Partial<User>): Promise<User> {
		const user = await this.getUser(userId);
		if (!user) {
			throw new Error('User not found');
		}

		const updatedUser = { ...user, ...updates, updatedAt: new Date() };
		this.users.set(userId, updatedUser);
		return updatedUser;
	}

	async updateUserTier(userId: string, tier: HabitTier): Promise<User> {
		return this.updateUser(userId, { currentTier: tier });
	}

	async updateUserSettings(userId: string, settings: UpdateUserSettingsRequest): Promise<User> {
		const user = await this.getUser(userId);
		if (!user) {
			throw new Error('User not found');
		}

		const updatedSettings = { ...user.settings, ...settings };
		return this.updateUser(userId, { settings: updatedSettings });
	}

	async updateUserStreak(userId: string, streak: number): Promise<User> {
		return this.updateUser(userId, { streak });
	}

	async deleteUser(userId: string): Promise<void> {
		this.users.delete(userId);
	}

	async getAllUsers(): Promise<User[]> {
		return Array.from(this.users.values());
	}

	async createDemoUser(): Promise<User> {
		const demoUser: User = {
			id: 'demo_user_123',
			email: 'demo@habit-tks.com',
			name: 'Demo User',
			currentTier: 'baseline',
			streak: 0,
			settings: {
				theme: 'light',
				notifications: true,
				strictMode: false,
				autoProgression: true
			},
			createdAt: new Date(),
			updatedAt: new Date()
		};

		this.users.set(demoUser.id, demoUser);
		return demoUser;
	}

	async getUserStats(userId: string): Promise<{
		currentTier: HabitTier;
		streak: number;
		totalHabits: number;
		completionRate: number;
	}> {
		const user = await this.getUser(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Mock stats - in real app, these would be calculated from actual data
		return {
			currentTier: user.currentTier,
			streak: user.streak,
			totalHabits: Math.floor(Math.random() * 10) + 4, // Random 4-13
			completionRate: Math.floor(Math.random() * 40) + 60 // Random 60-99%
		};
	}

	private generateUserId(): string {
		return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
