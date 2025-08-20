import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database.Database | null = null;
  private readonly dbPath: string;

  private constructor() {
    // Ensure database directory exists
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = path.join(dbDir, 'habit-tks.db');
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getConnection(): Database.Database {
    if (!this.db) {
      this.db = new Database(this.dbPath);
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');
      
      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      
      console.log(`📊 Database connected: ${this.dbPath}`);
    }
    return this.db;
  }

  public closeConnection(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('📊 Database connection closed');
    }
  }

  public getDatabasePath(): string {
    return this.dbPath;
  }

  // Graceful shutdown
  public static async shutdown(): Promise<void> {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.closeConnection();
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await DatabaseConnection.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await DatabaseConnection.shutdown();
  process.exit(0);
});

export default DatabaseConnection;
