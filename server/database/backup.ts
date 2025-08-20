import fs from 'fs';
import path from 'path';
import DatabaseConnection from './connection';

export class DatabaseBackup {
  private dbPath: string;
  private backupDir: string;

  constructor() {
    this.dbPath = DatabaseConnection.getInstance().getDatabasePath();
    this.backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a backup of the database
   */
  async createBackup(description?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const descriptionSuffix = description ? `_${description.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const backupFileName = `habit-tks_${timestamp}${descriptionSuffix}.db`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      // Close current connection to ensure file is not locked
      DatabaseConnection.getInstance().closeConnection();
      
      // Copy database file
      fs.copyFileSync(this.dbPath, backupPath);
      
      // Reopen connection
      DatabaseConnection.getInstance().getConnection();
      
      console.log(`📊 Database backup created: ${backupFileName}`);
      return backupPath;
    } catch (error) {
      // Ensure connection is reopened even if backup fails
      DatabaseConnection.getInstance().getConnection();
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  /**
   * Restore database from a backup file
   */
  async restoreBackup(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    try {
      // Close current connection
      DatabaseConnection.getInstance().closeConnection();
      
      // Create a backup of current database before restore
      const currentBackup = await this.createBackup('pre-restore');
      console.log(`📊 Current database backed up to: ${currentBackup}`);
      
      // Copy backup file to database location
      fs.copyFileSync(backupPath, this.dbPath);
      
      // Reopen connection
      DatabaseConnection.getInstance().getConnection();
      
      console.log(`📊 Database restored from: ${backupPath}`);
    } catch (error) {
      // Ensure connection is reopened even if restore fails
      DatabaseConnection.getInstance().getConnection();
      throw new Error(`Failed to restore backup: ${error}`);
    }
  }

  /**
   * List all available backups
   */
  getBackups(): Array<{
    filename: string;
    path: string;
    size: number;
    createdAt: Date;
  }> {
    const backups: Array<{
      filename: string;
      path: string;
      size: number;
      createdAt: Date;
    }> = [];

    try {
      const files = fs.readdirSync(this.backupDir);
      
      files.forEach(filename => {
        if (filename.endsWith('.db')) {
          const filePath = path.join(this.backupDir, filename);
          const stats = fs.statSync(filePath);
          
          backups.push({
            filename,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime
          });
        }
      });

      // Sort by creation date (newest first)
      backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Failed to list backups:', error);
    }

    return backups;
  }

  /**
   * Delete old backups (keep only the last N)
   */
  async cleanupOldBackups(keepCount: number = 10): Promise<void> {
    const backups = this.getBackups();
    
    if (backups.length <= keepCount) {
      console.log('📊 No cleanup needed - backup count within limit');
      return;
    }

    const backupsToDelete = backups.slice(keepCount);
    let deletedCount = 0;

    for (const backup of backupsToDelete) {
      try {
        fs.unlinkSync(backup.path);
        deletedCount++;
        console.log(`🗑️  Deleted old backup: ${backup.filename}`);
      } catch (error) {
        console.error(`Failed to delete backup ${backup.filename}:`, error);
      }
    }

    console.log(`📊 Cleanup completed: ${deletedCount} old backups removed`);
  }

  /**
   * Get backup statistics
   */
  getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  } {
    const backups = this.getBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null
      };
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const oldestBackup = backups[backups.length - 1].createdAt;
    const newestBackup = backups[0].createdAt;

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup,
      newestBackup
    };
  }

  /**
   * Auto-backup (called periodically)
   */
  async autoBackup(): Promise<void> {
    try {
      const stats = this.getBackupStats();
      const now = new Date();
      
      // Create backup if none exists or if last backup is older than 24 hours
      if (stats.newestBackup === null || 
          (now.getTime() - stats.newestBackup.getTime()) > 24 * 60 * 60 * 1000) {
        await this.createBackup('auto');
        
        // Cleanup old backups (keep last 20)
        await this.cleanupOldBackups(20);
      }
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  }
}

// Export singleton instance
export const databaseBackup = new DatabaseBackup();

// Set up auto-backup every 6 hours
setInterval(() => {
  databaseBackup.autoBackup();
}, 6 * 60 * 60 * 1000);
