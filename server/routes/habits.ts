import { Hono } from 'hono';
import { HabitService } from '../services/HabitService';
import { CreateHabitRequest, CompleteHabitRequest, SkipHabitRequest } from '../types/habit';

// Mock user ID for demo purposes - in real app, this would come from authentication
const MOCK_USER_ID = 'demo_user_123';

const habitRoutes = new Hono();

// Get all habits for a user
habitRoutes.get('/', async (c) => {
	try {
		const { tier } = c.req.query();
		const habitService = c.get('habitService') as HabitService;

		let habits;
		if (tier === 'baseline') {
			habits = await habitService.getBaselineHabits(MOCK_USER_ID);
		} else if (tier === 'tier2') {
			habits = await habitService.getTier2Habits(MOCK_USER_ID);
		} else if (tier === 'tier3') {
			habits = await habitService.getTier3Habits(MOCK_USER_ID);
		} else {
			// Get all active habits
			habits = await habitService.getAllActiveHabits(MOCK_USER_ID);
		}

		return c.json({
			success: true,
			data: habits
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch habits'
		}, 500);
	}
});

// Get a specific habit
habitRoutes.get('/:id', async (c) => {
	try {
		const { id } = c.req.param();
		const habitService = c.get('habitService') as HabitService;

		const habit = await habitService.getHabit(id);
		if (!habit) {
			return c.json({
				success: false,
				error: 'Habit not found'
			}, 404);
		}

		return c.json({
			success: true,
			data: habit
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch habit'
		}, 500);
	}
});

// Create a new habit
habitRoutes.post('/', async (c) => {
	try {
		const body = await c.req.json() as CreateHabitRequest;
		const habitService = c.get('habitService') as HabitService;

		const habit = await habitService.createHabit(MOCK_USER_ID, body);

		return c.json({
			success: true,
			message: 'Habit created successfully',
			data: habit
		}, 201);
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create habit'
		}, 400);
	}
});

// Complete a habit
habitRoutes.post('/:id/complete', async (c) => {
	try {
		const { id } = c.req.param();
		const body = await c.req.json() as CompleteHabitRequest;
		const habitService = c.get('habitService') as HabitService;

		const completion = await habitService.completeHabit(id, MOCK_USER_ID, body);

		return c.json({
			success: true,
			message: 'Habit completed successfully',
			data: completion
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to complete habit'
		}, 400);
	}
});

// Skip a habit
habitRoutes.post('/:id/skip', async (c) => {
	try {
		const { id } = c.req.param();
		const body = await c.req.json() as SkipHabitRequest;
		const habitService = c.get('habitService') as HabitService;

		await habitService.skipHabit(id, MOCK_USER_ID, body);

		return c.json({
			success: true,
			message: 'Habit skipped with reason recorded'
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to skip habit'
		}, 400);
	}
});

// Update a habit
habitRoutes.put('/:id', async (c) => {
	try {
		const { id } = c.req.param();
		const body = await c.req.json();
		const habitService = c.get('habitService') as HabitService;

		const habit = await habitService.updateHabit(id, MOCK_USER_ID, body);

		return c.json({
			success: true,
			message: 'Habit updated successfully',
			data: habit
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update habit'
		}, 400);
	}
});

// Delete a habit
habitRoutes.delete('/:id', async (c) => {
	try {
		const { id } = c.req.param();
		const habitService = c.get('habitService') as HabitService;

		await habitService.deleteHabit(id, MOCK_USER_ID);

		return c.json({
			success: true,
			message: 'Habit deleted successfully'
		});
	} catch (error) {
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete habit'
		}, 400);
	}
});

export { habitRoutes };
