import { Hono } from 'hono';
import { databaseBackup } from '../database/backup';
import { migrationManager } from '../database/migrations';
import DatabaseConnection from '../database/connection';
import { webSocketService } from '../services/WebSocketService';

const databaseRoutes = new Hono();

// Get database status
databaseRoutes.get('/status', async (c) => {
  try {
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

// Test WebSocket notifications
databaseRoutes.post('/test-websocket', async (c) => {
  try {
    const { type, userId = 'demo_user_123' } = await c.req.json();

    switch (type) {
      case 'habit_completed':
        webSocketService.notifyHabitCompleted(userId, {
          habitId: 'test_habit_123',
          habitName: 'Test Habit',
          tier: 'baseline',
          completionId: 'test_completion_123',
          completedAt: new Date()
        });
        break;

      case 'habit_skipped':
        webSocketService.notifyHabitSkipped(userId, {
          habitId: 'test_habit_123',
          habitName: 'Test Habit',
          tier: 'baseline',
          skipId: 'test_skip_123',
          reason: 'Testing WebSocket notifications',
          skippedAt: new Date()
        });
        break;

      case 'tier_unlocked':
        webSocketService.notifyTierUnlocked(userId, {
          tier: 'tier2',
          unlockedAt: new Date(),
          message: 'Test tier unlock notification!'
        });
        break;

      case 'streak_updated':
        webSocketService.notifyStreakUpdated(userId, {
          streak: 7,
          previousStreak: 6,
          updatedAt: new Date()
        });
        break;

      default:
        return c.json({
          success: false,
          error: 'Invalid notification type'
        }, 400);
    }

    return c.json({
      success: true,
      message: `WebSocket notification sent: ${type}`,
      data: {
        connectedClients: webSocketService.getConnectedClientsCount(),
        connectedUsers: webSocketService.getConnectedUsersCount()
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send WebSocket notification'
    }, 500);
  }
});

export { databaseRoutes };
