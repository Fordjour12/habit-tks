import { Hono } from 'hono';
import { AnalyticsService } from '../services/AnalyticsService';

// Mock user ID for demo purposes - in real app, this would come from authentication
const MOCK_USER_ID = 'demo_user_123';

const analyticsRoutes = new Hono();

// Get user analytics
analyticsRoutes.get('/user', async (c) => {
  try {
    const analyticsService = c.get('analyticsService') as AnalyticsService;

    const stats = await analyticsService.getUserStats(MOCK_USER_ID);

    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user analytics'
    }, 500);
  }
});

// Get habit analytics
analyticsRoutes.get('/habit/:habitId', async (c) => {
  try {
    const { habitId } = c.req.param();
    const analyticsService = c.get('analyticsService') as AnalyticsService;

    const stats = await analyticsService.getHabitStats(habitId);

    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch habit analytics'
    }, 500);
  }
});

// Get completion streak for a habit
analyticsRoutes.get('/streak/:habitId', async (c) => {
  try {
    const { habitId } = c.req.param();
    const { days } = c.req.query();

    // Mock streak data - in real app, this would query the database
    const streak = Math.floor(Math.random() * 30) + 1;
    const maxStreak = Math.floor(Math.random() * 100) + 1;
    const currentStreak = Math.floor(Math.random() * streak) + 1;

    return c.json({
      success: true,
      data: {
        habitId,
        currentStreak,
        maxStreak,
        totalDays: parseInt(days) || 30
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch streak data'
    }, 500);
  }
});

// Get weekly progress
analyticsRoutes.get('/weekly', async (c) => {
  try {
    const { week } = c.req.query();

    // Mock weekly data - in real app, this would query the database
    const weekData = {
      week: week || 'current',
      totalHabits: 4,
      completed: Math.floor(Math.random() * 4) + 1,
      skipped: Math.floor(Math.random() * 2),
      completionRate: Math.floor(Math.random() * 40) + 60,
      dailyProgress: [
        { day: 'Mon', completed: Math.floor(Math.random() * 4) + 1, total: 4 },
        { day: 'Tue', completed: Math.floor(Math.random() * 4) + 1, total: 4 },
        { day: 'Wed', completed: Math.floor(Math.random() * 4) + 1, total: 4 },
        { day: 'Thu', completed: Math.floor(Math.random() * 4) + 1, total: 4 },
        { day: 'Fri', completed: Math.floor(Math.random() * 4) + 1, total: 4 },
        { day: 'Sat', completed: Math.floor(Math.random() * 4) + 1, total: 4 },
        { day: 'Sun', completed: Math.floor(Math.random() * 4) + 1, total: 4 }
      ]
    };

    return c.json({
      success: true,
      data: weekData
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch weekly progress'
    }, 500);
  }
});

// Get monthly summary
analyticsRoutes.get('/monthly', async (c) => {
  try {
    const { month, year } = c.req.query();

    // Mock monthly data - in real app, this would query the database
    const monthData = {
      month: month || 'current',
      year: year || new Date().getFullYear(),
      totalHabits: 4,
      totalCompletions: Math.floor(Math.random() * 120) + 80,
      totalSkips: Math.floor(Math.random() * 20),
      averageStreak: Math.floor(Math.random() * 15) + 5,
      bestDay: 'Wednesday',
      worstDay: 'Sunday',
      categoryBreakdown: {
        fitness: Math.floor(Math.random() * 30) + 20,
        work: Math.floor(Math.random() * 30) + 20,
        learning: Math.floor(Math.random() * 30) + 20,
        productivity: Math.floor(Math.random() * 30) + 20
      }
    };

    return c.json({
      success: true,
      data: monthData
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monthly summary'
    }, 500);
  }
});

export { analyticsRoutes };
