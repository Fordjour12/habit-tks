import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContainer';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';

interface DatabaseStatus {
  database: {
    path: string;
    size: number;
    lastModified: string;
    connectionStatus: string;
  };
  migrations: {
    currentVersion: number;
    appliedMigrations: Array<{
      version: number;
      name: string;
      applied_at: string;
    }>;
  };
  backups: {
    totalBackups: number;
    totalSize: number;
    oldestBackup: string | null;
    newestBackup: string | null;
  };
}

interface Backup {
  filename: string;
  path: string;
  size: number;
  createdAt: string;
}

const Database: React.FC = () => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupDescription, setBackupDescription] = useState('');

  useEffect(() => {
    fetchStatus();
    fetchBackups();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/database/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      } else {
        throw new Error('Failed to fetch database status');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to fetch status'
      });
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/database/backups');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.data);
      } else {
        throw new Error('Failed to fetch backups');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to fetch backups'
      });
    }
  };

  const createBackup = async () => {
    if (!backupDescription.trim()) {
      showToast({
        type: 'warning',
        title: 'Warning',
        message: 'Please enter a backup description'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: backupDescription })
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Backup created successfully'
        });
        setBackupDescription('');
        fetchBackups();
        fetchStatus();
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create backup'
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to restore from backup: ${filename}? This will overwrite the current database.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/database/restore/${filename}`, {
        method: 'POST'
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Database restored successfully'
        });
        fetchStatus();
      } else {
        throw new Error('Failed to restore backup');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to restore backup'
      });
    } finally {
      setLoading(false);
    }
  };

  const runMigrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/database/migrate', {
        method: 'POST'
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Migrations completed successfully'
        });
        fetchStatus();
      } else {
        throw new Error('Failed to run migrations');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to run migrations'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading database status..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
        <Button onClick={fetchStatus} variant="secondary" size="sm">
          Refresh
        </Button>
      </div>

      {/* Database Status */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Path</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{status.database.path}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Size</p>
            <p className="font-medium">{formatBytes(status.database.size)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Modified</p>
            <p className="font-medium">{formatDate(status.database.lastModified)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant="success">{status.database.connectionStatus}</Badge>
          </div>
        </div>
      </Card>

      {/* Migrations */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Migrations</h2>
          <Button onClick={runMigrations} loading={loading} size="sm">
            Run Migrations
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Current Version: <Badge variant="primary">{status.migrations.currentVersion}</Badge>
          </p>
          <div className="space-y-1">
            {status.migrations.appliedMigrations.map((migration) => (
              <div key={migration.version} className="flex items-center space-x-2 text-sm">
                <Badge variant="success" size="sm">v{migration.version}</Badge>
                <span className="font-medium">{migration.name}</span>
                <span className="text-gray-500 text-xs">
                  {formatDate(migration.applied_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Backup Management */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Backup Management</h2>
        
        {/* Create Backup */}
        <div className="flex space-x-2 mb-6">
          <input
            type="text"
            placeholder="Backup description (optional)"
            value={backupDescription}
            onChange={(e) => setBackupDescription(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button onClick={createBackup} loading={loading} variant="success">
            Create Backup
          </Button>
        </div>

        {/* Backup Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{status.backups.totalBackups}</p>
            <p className="text-sm text-gray-600">Total Backups</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{formatBytes(status.backups.totalSize)}</p>
            <p className="text-sm text-gray-600">Total Size</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              {status.backups.newestBackup ? formatDate(status.backups.newestBackup).split(',')[0] : 'None'}
            </p>
            <p className="text-sm text-gray-600">Latest Backup</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              {status.backups.oldestBackup ? formatDate(status.backups.oldestBackup).split(',')[0] : 'None'}
            </p>
            <p className="text-sm text-gray-600">Oldest Backup</p>
          </div>
        </div>

        {/* Backup List */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Available Backups</h3>
          {backups.length === 0 ? (
            <p className="text-gray-500 text-sm">No backups available</p>
          ) : (
            backups.map((backup) => (
              <div key={backup.filename} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{backup.filename}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(backup.createdAt)} • {formatBytes(backup.size)}
                  </p>
                </div>
                <Button
                  onClick={() => restoreBackup(backup.filename)}
                  variant="warning"
                  size="sm"
                  disabled={loading}
                >
                  Restore
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Database;
