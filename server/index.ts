import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { habitRoutes } from './routes/habits'
import { userRoutes } from './routes/users'
import { setupRoutes } from './routes/setup'
import { analyticsRoutes } from './routes/analytics'
import { databaseRoutes } from './routes/database'
import { HabitService } from './services/HabitService'
import { UserService } from './services/UserService'
import { SetupService } from './services/SetupService'
import { ProgressionService } from './services/ProgressionService'
import { AnalyticsService } from './services/AnalyticsService'
import { migrationManager } from './database/migrations'

const app = new Hono()

// Initialize database and run migrations
async function initializeDatabase() {
	try {
		await migrationManager.migrate();
		console.log('📊 Database initialized successfully');
	} catch (error) {
		console.error('❌ Database initialization failed:', error);
		process.exit(1);
	}
}

// Initialize services
const progressionService = new ProgressionService()
const analyticsService = new AnalyticsService()
const habitService = new HabitService(progressionService, analyticsService)
const userService = new UserService()
const setupService = new SetupService(habitService, progressionService, userService)

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
	origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
	credentials: true,
}))

// Service injection middleware
app.use('*', async (c, next) => {
	// @ts-ignore - We know these services exist
	c.set('habitService', habitService)
	// @ts-ignore - We know these services exist
	c.set('userService', userService)
	// @ts-ignore - We know these services exist
	c.set('setupService', setupService)
	// @ts-ignore - We know these services exist
	c.set('analyticsService', analyticsService)
	// @ts-ignore - We know these services exist
	c.set('progressionService', progressionService)
	await next()
})

// Health check
app.get('/', (c) => c.json({ status: 'Habit TKS API is running' }))

// API routes
app.route('/api/habits', habitRoutes)
app.route('/api/users', userRoutes)
app.route('/api/setup', setupRoutes)
app.route('/api/analytics', analyticsRoutes)
app.route('/api/database', databaseRoutes)

// Error handling
app.onError((err, c) => {
	console.error('Unhandled error:', err)
	return c.json({
		success: false,
		error: 'Internal server error',
		message: err.message
	}, 500)
})

// 404 handler
app.notFound((c) => {
	return c.json({
		success: false,
		error: 'Not found'
	}, 404)
})

const port = process.env.PORT || 3055

// Start server after database initialization
async function startServer() {
	await initializeDatabase();

	console.log(`🚀 Habit TKS server running on port ${port}`)

	serve({
		fetch: app.fetch,
		port: Number(port)
	})
}

startServer().catch((error) => {
	console.error('❌ Failed to start server:', error);
	process.exit(1);
});
