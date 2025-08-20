import Database from 'better-sqlite3';
import DatabaseConnection from '../connection';
import { Habit, CreateHabitRequest, CompleteHabitRequest, SkipHabitRequest } from '../../types/habit';

export class HabitRepository {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseConnection.getInstance().getConnection();
  }

  async createHabit(habitData: CreateHabitRequest): Promise<Habit> {
    const habitId = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const insertStmt = this.db.prepare(`
      INSERT INTO habits (
        id, user_id, name, description, category, tier, frequency, 
        reminder_time, notes, priority, streak_tracking, skip_allowed, start_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      habitId,
      habitData.userId,
      habitData.name,
      habitData.description,
      habitData.category,
      habitData.tier,
      habitData.frequency,
      habitData.reminderTime,
      habitData.notes,
      habitData.priority,
      habitData.streakTracking ? 1 : 0,
      habitData.skipAllowed ? 1 : 0,
      habitData.startDate
    );

    return this.getHabitById(habitId);
  }

  async getHabitById(habitId: string): Promise<Habit | null> {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id, name, description, category, tier, frequency,
        reminder_time, notes, priority, streak_tracking, skip_allowed,
        start_date, is_active, created_at, updated_at
      FROM habits 
      WHERE id = ?
    `);
    
    const result = stmt.get(habitId) as any;
    
    if (!result) return null;

    return {
      id: result.id,
      userId: result.user_id,
      name: result.name,
      description: result.description,
      category: result.category,
      tier: result.tier,
      frequency: result.frequency,
      reminderTime: result.reminder_time,
      notes: result.notes,
      priority: result.priority,
      streakTracking: Boolean(result.streak_tracking),
      skipAllowed: Boolean(result.skip_allowed),
      startDate: result.start_date,
      isActive: Boolean(result.is_active),
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at)
    };
  }

  async getHabitsByUserId(userId: string, tier?: string): Promise<Habit[]> {
    let query = `
      SELECT 
        id, user_id, name, description, category, tier, frequency,
        reminder_time, notes, priority, streak_tracking, skip_allowed,
        start_date, is_active, created_at, updated_at
      FROM habits 
      WHERE user_id = ? AND is_active = 1
    `;
    
    const params: any[] = [userId];
    
    if (tier) {
      query += ' AND tier = ?';
      params.push(tier);
    }
    
    query += ' ORDER BY priority DESC, created_at ASC';
    
    const stmt = this.db.prepare(query);
    const results = stmt.all(...params) as any[];
    
    return results.map(result => ({
      id: result.id,
      userId: result.user_id,
      name: result.name,
      description: result.description,
      category: result.category,
      tier: result.tier,
      frequency: result.frequency,
      reminderTime: result.reminder_time,
      notes: result.notes,
      priority: result.priority,
      streakTracking: Boolean(result.streak_tracking),
      skipAllowed: Boolean(result.skip_allowed),
      startDate: result.start_date,
      isActive: Boolean(result.is_active),
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at)
    }));
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const fields: string[] = [];
    const values: any[] = [];
    
    // Build dynamic update query
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.tier !== undefined) {
      fields.push('tier = ?');
      values.push(updates.tier);
    }
    if (updates.frequency !== undefined) {
      fields.push('frequency = ?');
      values.push(updates.frequency);
    }
    if (updates.reminderTime !== undefined) {
      fields.push('reminder_time = ?');
      values.push(updates.reminderTime);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.streakTracking !== undefined) {
      fields.push('streak_tracking = ?');
      values.push(updates.streakTracking ? 1 : 0);
    }
    if (updates.skipAllowed !== undefined) {
      fields.push('skip_allowed = ?');
      values.push(updates.skipAllowed ? 1 : 0);
    }
    if (updates.startDate !== undefined) {
      fields.push('start_date = ?');
      values.push(updates.startDate);
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.isActive ? 1 : 0);
    }
    
    if (fields.length === 0) {
      return this.getHabitById(habitId) as Promise<Habit>;
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(habitId);
    
    const updateStmt = this.db.prepare(`
      UPDATE habits 
      SET ${fields.join(', ')}
      WHERE id = ?
    `);
    
    updateStmt.run(...values);

    const updatedHabit = await this.getHabitById(habitId);
    if (!updatedHabit) {
      throw new Error('Habit not found after update');
    }
    
    return updatedHabit;
  }

  async deleteHabit(habitId: string): Promise<void> {
    const deleteStmt = this.db.prepare('DELETE FROM habits WHERE id = ?');
    deleteStmt.run(habitId);
  }

  async completeHabit(habitId: string, completionData: CompleteHabitRequest): Promise<void> {
    const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const insertStmt = this.db.prepare(`
      INSERT INTO habit_completions (
        id, habit_id, user_id, notes, duration, intensity, additional_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      completionId,
      habitId,
      completionData.userId,
      completionData.notes,
      completionData.metrics?.duration,
      completionData.metrics?.intensity,
      completionData.metrics?.additionalData ? JSON.stringify(completionData.metrics.additionalData) : null
    );
  }

  async skipHabit(habitId: string, skipData: SkipHabitRequest): Promise<void> {
    const skipId = `skip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const insertStmt = this.db.prepare(`
      INSERT INTO habit_skips (
        id, habit_id, user_id, reason
      ) VALUES (?, ?, ?, ?)
    `);
    
    insertStmt.run(
      skipId,
      habitId,
      skipData.userId,
      skipData.reason
    );
  }

  async getHabitCompletions(habitId: string, days: number = 30): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id, habit_id, user_id, completed_at, notes, duration, intensity, additional_data
      FROM habit_completions 
      WHERE habit_id = ? 
      AND completed_at >= datetime('now', '-${days} days')
      ORDER BY completed_at DESC
    `);
    
    const results = stmt.all(habitId) as any[];
    
    return results.map(result => ({
      id: result.id,
      habitId: result.habit_id,
      userId: result.user_id,
      completedAt: new Date(result.completed_at),
      notes: result.notes,
      metrics: {
        duration: result.duration,
        intensity: result.intensity,
        additionalData: result.additional_data ? JSON.parse(result.additional_data) : null
      }
    }));
  }

  async getHabitSkips(habitId: string, days: number = 30): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id, habit_id, user_id, skipped_at, reason
      FROM habit_skips 
      WHERE habit_id = ? 
      AND skipped_at >= datetime('now', '-${days} days')
      ORDER BY skipped_at DESC
    `);
    
    const results = stmt.all(habitId) as any[];
    
    return results.map(result => ({
      id: result.id,
      habitId: result.habit_id,
      userId: result.user_id,
      skippedAt: new Date(result.skipped_at),
      reason: result.reason
    }));
  }

  async getHabitStats(habitId: string): Promise<{
    totalCompletions: number;
    totalSkips: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    // Get total completions
    const completionsStmt = this.db.prepare('SELECT COUNT(*) as count FROM habit_completions WHERE habit_id = ?');
    const completionsResult = completionsStmt.get(habitId) as { count: number };
    
    // Get total skips
    const skipsStmt = this.db.prepare('SELECT COUNT(*) as count FROM habit_skips WHERE habit_id = ?');
    const skipsResult = skipsStmt.get(habitId) as { count: number };
    
    // For now, return basic stats (streak calculation would be more complex)
    return {
      totalCompletions: completionsResult.count,
      totalSkips: skipsResult.count,
      currentStreak: 0, // TODO: Implement streak calculation
      longestStreak: 0  // TODO: Implement streak calculation
    };
  }

  async getHabitsByCategory(userId: string, category: string): Promise<Habit[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id, name, description, category, tier, frequency,
        reminder_time, notes, priority, streak_tracking, skip_allowed,
        start_date, is_active, created_at, updated_at
      FROM habits 
      WHERE user_id = ? AND category = ? AND is_active = 1
      ORDER BY priority DESC, created_at ASC
    `);
    
    const results = stmt.all(userId, category) as any[];
    
    return results.map(result => ({
      id: result.id,
      userId: result.user_id,
      name: result.name,
      description: result.description,
      category: result.category,
      tier: result.tier,
      frequency: result.frequency,
      reminderTime: result.reminder_time,
      notes: result.notes,
      priority: result.priority,
      streakTracking: Boolean(result.streak_tracking),
      skipAllowed: Boolean(result.skip_allowed),
      startDate: result.start_date,
      isActive: Boolean(result.is_active),
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at)
    }));
  }
}
