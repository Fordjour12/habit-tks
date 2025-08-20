import Database from 'better-sqlite3';

export interface DatabaseSchema {
  users: string;
  habits: string;
  habit_completions: string;
  habit_skips: string;
  user_settings: string;
  tier_progression: string;
  analytics_events: string;
}

export const createTables = (db: Database.Database): void => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      current_tier TEXT NOT NULL DEFAULT 'baseline',
      streak INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'light',
      notifications BOOLEAN NOT NULL DEFAULT 1,
      strict_mode BOOLEAN NOT NULL DEFAULT 0,
      auto_progression BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Habits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      tier TEXT NOT NULL,
      frequency TEXT NOT NULL,
      reminder_time TEXT,
      notes TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      streak_tracking BOOLEAN NOT NULL DEFAULT 1,
      skip_allowed BOOLEAN NOT NULL DEFAULT 1,
      start_date DATE NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Habit completions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      duration INTEGER,
      intensity TEXT,
      additional_data TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Habit skips table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_skips (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      skipped_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reason TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tier progression table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tier_progression (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      from_tier TEXT NOT NULL,
      to_tier TEXT NOT NULL,
      progression_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      requirements_met TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Analytics events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
    CREATE INDEX IF NOT EXISTS idx_habits_tier ON habits(tier);
    CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);
    CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id);
    CREATE INDEX IF NOT EXISTS idx_completions_user_id ON habit_completions(user_id);
    CREATE INDEX IF NOT EXISTS idx_completions_completed_at ON habit_completions(completed_at);
    CREATE INDEX IF NOT EXISTS idx_skips_habit_id ON habit_skips(habit_id);
    CREATE INDEX IF NOT EXISTS idx_skips_user_id ON habit_skips(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
  `);

  console.log('📊 Database schema created successfully');
};

export const dropTables = (db: Database.Database): void => {
  const tables = [
    'analytics_events',
    'tier_progression',
    'habit_skips',
    'habit_completions',
    'habits',
    'user_settings',
    'users'
  ];

  tables.forEach(table => {
    db.exec(`DROP TABLE IF EXISTS ${table}`);
  });

  console.log('📊 Database tables dropped successfully');
};

export const resetDatabase = (db: Database.Database): void => {
  dropTables(db);
  createTables(db);
  console.log('📊 Database reset successfully');
};
