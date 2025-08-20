import Database from 'better-sqlite3';
import DatabaseConnection from '../connection';
import { User, CreateUserRequest, UpdateUserSettingsRequest } from '../../types/user';

export class UserRepository {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseConnection.getInstance().getConnection();
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert user
    const insertUserStmt = this.db.prepare(`
      INSERT INTO users (id, email, name, current_tier, streak)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertUserStmt.run(
      userId,
      userData.email,
      userData.name,
      'baseline',
      0
    );

    // Insert default user settings
    const insertSettingsStmt = this.db.prepare(`
      INSERT INTO user_settings (user_id, theme, notifications, strict_mode, auto_progression)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertSettingsStmt.run(
      userId,
      'light',
      true,
      false,
      true
    );

    return this.getUserById(userId);
  }

  async getUserById(userId: string): Promise<User | null> {
    const stmt = this.db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.current_tier,
        u.streak,
        u.created_at,
        u.updated_at,
        us.theme,
        us.notifications,
        us.strict_mode,
        us.auto_progression
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE u.id = ?
    `);
    
    const result = stmt.get(userId) as any;
    
    if (!result) return null;

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      currentTier: result.current_tier,
      streak: result.streak,
      settings: {
        theme: result.theme,
        notifications: Boolean(result.notifications),
        strictMode: Boolean(result.strict_mode),
        autoProgression: Boolean(result.auto_progression)
      },
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at)
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.current_tier,
        u.streak,
        u.created_at,
        u.updated_at,
        us.theme,
        us.notifications,
        us.strict_mode,
        us.auto_progression
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE u.email = ?
    `);
    
    const result = stmt.get(email) as any;
    
    if (!result) return null;

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      currentTier: result.current_tier,
      streak: result.streak,
      settings: {
        theme: result.theme,
        notifications: Boolean(result.notifications),
        strictMode: Boolean(result.strict_mode),
        autoProgression: Boolean(result.auto_progression)
      },
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at)
    };
  }

  async updateUserSettings(userId: string, settings: UpdateUserSettingsRequest): Promise<User> {
    const updateStmt = this.db.prepare(`
      UPDATE user_settings 
      SET 
        theme = COALESCE(?, theme),
        notifications = COALESCE(?, notifications),
        strict_mode = COALESCE(?, strict_mode),
        auto_progression = COALESCE(?, auto_progression),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    
    updateStmt.run(
      settings.theme,
      settings.notifications,
      settings.strictMode,
      settings.autoProgression,
      userId
    );

    // Update user's updated_at timestamp
    const updateUserStmt = this.db.prepare(`
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateUserStmt.run(userId);

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  }

  async updateUserTier(userId: string, newTier: string): Promise<User> {
    const updateStmt = this.db.prepare(`
      UPDATE users 
      SET current_tier = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    updateStmt.run(newTier, userId);

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  }

  async updateUserStreak(userId: string, newStreak: number): Promise<void> {
    const updateStmt = this.db.prepare(`
      UPDATE users 
      SET streak = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    updateStmt.run(newStreak, userId);
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user (cascading will handle related records)
    const deleteStmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    deleteStmt.run(userId);
  }

  async getAllUsers(): Promise<User[]> {
    const stmt = this.db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.current_tier,
        u.streak,
        u.created_at,
        u.updated_at,
        us.theme,
        us.notifications,
        us.strict_mode,
        us.auto_progression
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      ORDER BY u.created_at DESC
    `);
    
    const results = stmt.all() as any[];
    
    return results.map(result => ({
      id: result.id,
      email: result.email,
      name: result.name,
      currentTier: result.current_tier,
      streak: result.streak,
      settings: {
        theme: result.theme,
        notifications: Boolean(result.notifications),
        strictMode: Boolean(result.strict_mode),
        autoProgression: Boolean(result.auto_progression)
      },
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at)
    }));
  }

  async getUserCount(): Promise<number> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}
