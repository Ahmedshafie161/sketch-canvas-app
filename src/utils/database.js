import Dexie from 'dexie';

// Local Database
class SketchDatabase extends Dexie {
  constructor() {
    super('SketchCanvasDB');
    
    this.version(1).stores({
      users: '++id, username',
      folders: '++id, userId, parentId, name',
      files: '++id, userId, folderId, name, createdAt, updatedAt',
      canvasObjects: '++id, fileId, type, data',
      connections: '++id, fileId, from, to',
      animations: '++id, fileId, objectId, type, duration',
      voiceRecordings: '++id, fileId, objectId, audioData, transcript, createdAt'
    });

    this.users = this.table('users');
    this.folders = this.table('folders');
    this.files = this.table('files');
    this.canvasObjects = this.table('canvasObjects');
    this.connections = this.table('connections');
    this.animations = this.table('animations');
    this.voiceRecordings = this.table('voiceRecordings');
  }
}

export const db = new SketchDatabase();

// Remote Sync Functions
export class RemoteSync {
  constructor(serverUrl) {
    this.serverUrl = serverUrl || 'http://localhost:3001/api'; // Configure your server
    this.syncEnabled = false;
  }

  async enableSync(enabled) {
    this.syncEnabled = enabled;
  }

  async syncToRemote(userId) {
    if (!this.syncEnabled) return { success: false, message: 'Sync disabled' };

    try {
      const folders = await db.folders.where('userId').equals(userId).toArray();
      const files = await db.files.where('userId').equals(userId).toArray();
      const canvasObjects = await db.canvasObjects.toArray();
      const connections = await db.connections.toArray();
      const animations = await db.animations.toArray();

      const response = await fetch(`${this.serverUrl}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          folders,
          files,
          canvasObjects,
          connections,
          animations,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        return { success: true, message: 'Synced to remote' };
      } else {
        return { success: false, message: 'Sync failed' };
      }
    } catch (error) {
      console.error('Remote sync error:', error);
      return { success: false, message: error.message };
    }
  }

  async syncFromRemote(userId) {
    if (!this.syncEnabled) return { success: false, message: 'Sync disabled' };

    try {
      const response = await fetch(`${this.serverUrl}/sync/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Clear local data
        await db.folders.where('userId').equals(userId).delete();
        await db.files.where('userId').equals(userId).delete();
        
        // Import remote data
        if (data.folders) await db.folders.bulkAdd(data.folders);
        if (data.files) await db.files.bulkAdd(data.files);
        if (data.canvasObjects) await db.canvasObjects.bulkAdd(data.canvasObjects);
        if (data.connections) await db.connections.bulkAdd(data.connections);
        if (data.animations) await db.animations.bulkAdd(data.animations);

        return { success: true, message: 'Synced from remote' };
      } else {
        return { success: false, message: 'Sync failed' };
      }
    } catch (error) {
      console.error('Remote sync error:', error);
      return { success: false, message: error.message };
    }
  }
}

export const remoteSync = new RemoteSync();
