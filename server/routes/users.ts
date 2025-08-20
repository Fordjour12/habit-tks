import { Hono } from 'hono';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserSettingsRequest } from '../types/user';

// Mock user ID for demo purposes - in real app, this would come from authentication
const MOCK_USER_ID = 'demo_user_123';

const userRoutes = new Hono();

// Get current user
userRoutes.get('/me', async (c) => {
	try {
		const userService = c.get('userService') as UserService;

		const user = await userService.getUser(MOCK_USER_ID);
		if (!user) {
			return c.json({
				success: false,
				error: 'User not found'
			}, 404);
		}

		return c.json({
			success: true,
			data: user
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch user'
		}, 500);
	}
});

// Get user stats
userRoutes.get('/me/stats', async (c) => {
	try {
		const userService = c.get('userService') as UserService;

		const stats = await userService.getUserStats(MOCK_USER_ID);

		return c.json({
			success: true,
			data: stats
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch user stats'
		}, 500);
	}
});

// Create a new user
userRoutes.post('/', async (c) => {
	try {
		const body = await c.req.json() as CreateUserRequest;
		const userService = c.get('userService') as UserService;

		const user = await userService.createUser(body);

		return c.json({
			success: true,
			message: 'User created successfully',
			data: user
		}, 201);
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create user'
		}, 400);
	}
});

// Update user settings
userRoutes.put('/me/settings', async (c) => {
	try {
		const body = await c.req.json() as UpdateUserSettingsRequest;
		const userService = c.get('userService') as UserService;

		const user = await userService.updateUserSettings(MOCK_USER_ID, body);

		return c.json({
			success: true,
			message: 'Settings updated successfully',
			data: user
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update settings'
		}, 400);
	}
});

// Update user tier
userRoutes.put('/me/tier', async (c) => {
	try {
		const { tier } = await c.req.json();
		const userService = c.get('userService') as UserService;

		const user = await userService.updateUserTier(MOCK_USER_ID, tier);

		return c.json({
			success: true,
			message: 'Tier updated successfully',
			data: user
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update tier'
		}, 400);
	}
});

// Get all users (admin only)
userRoutes.get('/', async (c) => {
	try {
		const userService = c.get('userService') as UserService;

		const users = await userService.getAllUsers();

		return c.json({
			success: true,
			data: users
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch users'
		}, 500);
	}
});

export { userRoutes };
