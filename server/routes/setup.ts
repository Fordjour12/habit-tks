import { Hono } from 'hono';
import { SetupService } from '../services/SetupService';

const setupRoutes = new Hono();

// Create demo user
setupRoutes.post('/demo-user', async (c) => {
	try {
		// @ts-ignore - We know the service exists
		const userService = c.get('userService') as any;

		const demoUser = await userService.createDemoUser();

		return c.json({
			success: true,
			message: 'Demo user created successfully',
			data: demoUser
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create demo user'
		}, 500);
	}
});

// Setup user account with default habits
setupRoutes.post('/account', async (c) => {
	try {
		// @ts-ignore - We know the service exists
		const setupService = c.get('setupService') as SetupService;

		// For demo purposes, use a fixed user ID that we know exists
		const userId = 'demo_user_123';

		const result = await setupService.setupUserAccount(userId);

		return c.json({
			success: true,
			message: result.message,
			data: {
				baselineHabits: result.baselineHabits,
				tier2UnlockDate: result.tier2UnlockDate.toISOString().split('T')[0]
			}
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to setup account'
		}, 500);
	}
});

// Reset user account
setupRoutes.post('/reset', async (c) => {
	try {
		// @ts-ignore - We know the service exists
		const setupService = c.get('setupService') as SetupService;

		const userId = 'demo_user_123';
		const result = await setupService.resetUserAccount(userId);

		return c.json({
			success: true,
			message: result.message
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to reset account'
		}, 500);
	}
});

// Manually unlock tier2
setupRoutes.post('/unlock/tier2', async (c) => {
	try {
		// @ts-ignore - We know the service exists
		const setupService = c.get('setupService') as SetupService;

		const userId = 'demo_user_123';
		const result = await setupService.unlockTier2(userId);

		return c.json({
			success: true,
			message: result.message
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to unlock tier2'
		}, 500);
	}
});

// Manually unlock tier3
setupRoutes.post('/unlock/tier3', async (c) => {
	try {
		// @ts-ignore - We know the service exists
		const setupService = c.get('setupService') as SetupService;

		const userId = 'demo_user_123';
		const result = await setupService.unlockTier3(userId);

		return c.json({
			success: true,
			message: result.message
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to unlock tier3'
		}, 500);
	}
});

export { setupRoutes };
