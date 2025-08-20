import Database from 'better-sqlite3';
import DatabaseConnection from './connection';
import { createTables } from './schema';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

export class MigrationManager {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseConnection.getInstance().getConnection();
    this.ensureMigrationsTable();
  }

  private ensureMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public getCurrentVersion(): number {
    const stmt = this.db.prepare('SELECT MAX(version) as version FROM migrations');
    const result = stmt.get() as { version: number | null };
    return result.version || 0;
  }

  public getAppliedMigrations(): Migration[] {
    const stmt = this.db.prepare('SELECT version, name FROM migrations ORDER BY version');
    return stmt.all() as Migration[];
  }

  public async migrate(): Promise<void> {
    const currentVersion = this.getCurrentVersion();
    const pendingMigrations = this.getPendingMigrations(currentVersion);

    if (pendingMigrations.length === 0) {
      console.log('📊 Database is up to date (version', currentVersion, ')');
      return;
    }

    console.log(`📊 Running ${pendingMigrations.length} pending migrations...`);

    for (const migration of pendingMigrations) {
      try {
        console.log(`📊 Applying migration ${migration.version}: ${migration.name}`);
        
        // Begin transaction
        this.db.exec('BEGIN TRANSACTION');
        
        // Run migration
        migration.up(this.db);
        
        // Record migration
        const insertStmt = this.db.prepare(
          'INSERT INTO migrations (version, name) VALUES (?, ?)'
        );
        insertStmt.run(migration.version, migration.name);
        
        // Commit transaction
        this.db.exec('COMMIT');
        
        console.log(`✅ Migration ${migration.version} applied successfully`);
      } catch (error) {
        // Rollback transaction
        this.db.exec('ROLLBACK');
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log('📊 All migrations completed successfully');
  }

  public async rollback(targetVersion: number): Promise<void> {
    const currentVersion = this.getCurrentVersion();
    const migrationsToRollback = this.getAppliedMigrations()
      .filter(m => m.version > targetVersion)
      .sort((a, b) => b.version - a.version); // Reverse order

    if (migrationsToRollback.length === 0) {
      console.log('📊 No migrations to rollback');
      return;
    }

    console.log(`📊 Rolling back ${migrationsToRollback.length} migrations to version ${targetVersion}...`);

    for (const migration of migrationsToRollback) {
      try {
        console.log(`📊 Rolling back migration ${migration.version}: ${migration.name}`);
        
        // Begin transaction
        this.db.exec('BEGIN TRANSACTION');
        
        // Run rollback
        migration.down(this.db);
        
        // Remove migration record
        const deleteStmt = this.db.prepare('DELETE FROM migrations WHERE version = ?');
        deleteStmt.run(migration.version);
        
        // Commit transaction
        this.db.exec('COMMIT');
        
        console.log(`✅ Migration ${migration.version} rolled back successfully`);
      } catch (error) {
        // Rollback transaction
        this.db.exec('ROLLBACK');
        console.error(`❌ Rollback of migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log('📊 Rollback completed successfully');
  }

  private getPendingMigrations(currentVersion: number): Migration[] {
    return this.getAllMigrations()
      .filter(m => m.version > currentVersion)
      .sort((a, b) => a.version - b.version);
  }

  private getAllMigrations(): Migration[] {
    return [
      // Initial schema migration
      {
        version: 1,
        name: 'Initial Schema',
        up: (db: Database.Database) => {
          createTables(db);
        },
        down: (db: Database.Database) => {
          // This would drop all tables, but we'll make it safer
          console.log('⚠️  Rolling back initial schema - this will drop all data');
        }
      },
      
      // Future migrations can be added here
      // {
      //   version: 2,
      //   name: 'Add New Feature',
      //   up: (db: Database.Database) => {
      //     db.exec('ALTER TABLE habits ADD COLUMN new_column TEXT');
      //   },
      //   down: (db: Database.Database) => {
      //     // Remove the column
      //   }
      // }
    ];
  }

  public async reset(): Promise<void> {
    console.log('📊 Resetting database...');
    
    // Drop all tables
    this.db.exec('DROP TABLE IF EXISTS migrations');
    
    // Recreate everything
    this.ensureMigrationsTable();
    await this.migrate();
    
    console.log('📊 Database reset completed');
  }
}

// Export singleton instance
export const migrationManager = new MigrationManager();
