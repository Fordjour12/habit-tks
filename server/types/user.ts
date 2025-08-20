import { HabitTier } from './habit';

export interface User {
	id: string;
	email: string;
	name: string;
	currentTier: HabitTier;
	streak: number;
	settings: UserSettings;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserSettings {
	theme: 'light' | 'dark';
	notifications: boolean;
	strictMode: boolean;
	autoProgression: boolean;
}

export interface CreateUserRequest {
	email: string;
	name: string;
}

export interface UpdateUserSettingsRequest {
	theme?: 'light' | 'dark';
	notifications?: boolean;
	strictMode?: boolean;
	autoProgression?: boolean;
}
