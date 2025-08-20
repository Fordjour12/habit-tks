import { Context } from 'hono'
import { HabitService } from '../services/HabitService'
import { UserService } from '../services/UserService'
import { SetupService } from '../services/SetupService'
import { AnalyticsService } from '../services/AnalyticsService'
import { ProgressionService } from '../services/ProgressionService'

export interface AppContext extends Context {
	get(key: 'habitService'): HabitService
	get(key: 'userService'): UserService
	get(key: 'setupService'): SetupService
	get(key: 'analyticsService'): AnalyticsService
	get(key: 'progressionService'): ProgressionService
}
