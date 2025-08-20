import { Hono } from 'hono';
import { databaseBackup } from '../database/backup';
import { migrationManager } from '../database/migrations';
import DatabaseConnection from '../database/connection';

const databaseRoutes = new Hono();

// Get database status
databaseRoutes.get('/status', async (c) => {
  try {
    const db = DatabaseConnection.getInstance().getConnection();
    const backupStats = databaseBackup.getBackupStats();
    
    // Get database file info
    const dbPath = DatabaseConnection.getInstance().getDatabasePath();
    const fs = await import('fs');
    const dbStats = fs.statSync(dbPath);
    
    return c.json({
      success: true,
      data: {
        database: {
          path: dbPath,
          size: dbStats.size,
          lastModified: dbStats.mtime,
          connectionStatus: 'connected'
        },
        migrations: {
          currentVersion: migrationManager.getCurrentVersion(),
          appliedMigrations: migrationManager.getAppliedMigrations()
        },
        backups: backupStats
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get database status'
    }, 500);
  }
});

// Create manual backup
databaseRoutes.post('/backup', async (c) => {
  try {
    const { description } = await c.req.json();
    const backupPath = await databaseBackup.createBackup(description);
    
    return c.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        backupPath,
        filename: backupPath.split('/').pop()
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create backup'
    }, 500);
  }
});

// List all backups
databaseRoutes.get('/backups', async (c) => {
  try {
    const backups = databaseBackup.getBackups();
    
    return c.json({
      success: true,
      data: backups
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list backups'
    }, 500);
  }
});

// Restore from backup
databaseRoutes.post('/restore/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    const backups = databaseBackup.getBackups();
    const backup = backups.find(b => b.filename === filename);
    
    if (!backup) {
      return c.json({
        success: false,
        error: 'Backup not found'
      }, 404);
    }
    
    await databaseBackup.restoreBackup(backup.path);
    
    return c.json({
      success: true,
      message: 'Database restored successfully',
      data: {
        restoredFrom: filename
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to restore backup'
    }, 500);
  }
});

// Reset database (development only)
databaseRoutes.post('/reset', async (c) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return c.json({
        success: false,
        error: 'Database reset not allowed in production'
      }, 403);
    }
    
    await migrationManager.reset();
    
    return c.json({
      success: true,
      message: 'Database reset successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset database'
    }, 500);
  }
});

// Run migrations
databaseRoutes.post('/migrate', async (c) => {
  try {
    await migrationManager.migrate();
    
    return c.json({
      success: true,
      message: 'Migrations completed successfully',
      data: {
        currentVersion: migrationManager.getCurrentVersion()
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run migrations'
    }, 500);
  }
});

// Get migration status
databaseRoutes.get('/migrations', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        currentVersion: migrationManager.getCurrentVersion(),
        appliedMigrations: migrationManager.getAppliedMigrations()
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get migration status'
    }, 500);
  }
});

export { databaseRoutes };
