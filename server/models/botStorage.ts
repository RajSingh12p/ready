import { Db, ObjectId } from 'mongodb';
import { getDb } from '../db';
import { addLogEntry } from '../handlers/events';
import { COLLECTION_NAMES } from '../db';

// Interface for server info
export interface IServer {
  _id?: ObjectId;
  serverId: string;
  name: string;
  joinedAt: Date;
}

// Interface for role info
export interface IRole {
  _id?: ObjectId;
  roleId: string;
  serverId: string;
  name: string;
  memberCount: number;
}

// Interface for DM logs
export interface IDmLog {
  _id?: ObjectId;
  roleId: string;
  message: string;
  sentCount: number;
  failedCount: number;
  timestamp: Date;
}

// Interface for bot configuration
export interface IBotConfig {
  _id?: ObjectId;
  key: string;
  value: any;
}

/**
 * BotStorage class for MongoDB data operations
 */
export class BotStorage {
  private db: Db;

  constructor(db?: Db) {
    this.db = db || getDb();
  }

  // Server operations
  async saveServer(server: IServer): Promise<IServer> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.SERVERS);
      
      // Check if server already exists
      const existingServer = await collection.findOne({ serverId: server.serverId });
      
      if (existingServer) {
        // Update existing server
        await collection.updateOne(
          { serverId: server.serverId },
          { $set: { name: server.name } }
        );
        return { ...existingServer, name: server.name } as IServer;
      } else {
        // Create new server
        const result = await collection.insertOne(server);
        return { ...server, _id: result.insertedId };
      }
    } catch (error: any) {
      addLogEntry('error', `Failed to save server: ${error.message}`);
      throw error;
    }
  }

  async getServers(): Promise<IServer[]> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.SERVERS);
      return await collection.find().toArray() as IServer[];
    } catch (error: any) {
      addLogEntry('error', `Failed to get servers: ${error.message}`);
      throw error;
    }
  }

  // Role operations
  async saveRole(role: IRole): Promise<IRole> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.ROLES);
      
      // Check if role already exists
      const existingRole = await collection.findOne({ roleId: role.roleId });
      
      if (existingRole) {
        // Update existing role
        await collection.updateOne(
          { roleId: role.roleId },
          { $set: { 
            name: role.name,
            memberCount: role.memberCount 
          }}
        );
        return { ...existingRole, name: role.name, memberCount: role.memberCount } as IRole;
      } else {
        // Create new role
        const result = await collection.insertOne(role);
        return { ...role, _id: result.insertedId };
      }
    } catch (error: any) {
      addLogEntry('error', `Failed to save role: ${error.message}`);
      throw error;
    }
  }

  async getRoles(serverId?: string): Promise<IRole[]> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.ROLES);
      const query = serverId ? { serverId } : {};
      return await collection.find(query).toArray() as IRole[];
    } catch (error: any) {
      addLogEntry('error', `Failed to get roles: ${error.message}`);
      throw error;
    }
  }

  // DM log operations
  async saveDmLog(dmLog: IDmLog): Promise<IDmLog> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.DM_LOGS);
      const result = await collection.insertOne({
        ...dmLog,
        timestamp: new Date()
      });
      return { ...dmLog, _id: result.insertedId };
    } catch (error: any) {
      addLogEntry('error', `Failed to save DM log: ${error.message}`);
      throw error;
    }
  }

  async getDmLogs(roleId?: string): Promise<IDmLog[]> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.DM_LOGS);
      const query = roleId ? { roleId } : {};
      return await collection.find(query).sort({ timestamp: -1 }).toArray() as IDmLog[];
    } catch (error: any) {
      addLogEntry('error', `Failed to get DM logs: ${error.message}`);
      throw error;
    }
  }

  // Bot config operations
  async setBotConfig(key: string, value: any): Promise<IBotConfig> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.BOT_CONFIG);
      
      // Check if config already exists
      const existingConfig = await collection.findOne({ key });
      
      if (existingConfig) {
        // Update existing config
        await collection.updateOne(
          { key },
          { $set: { value } }
        );
        return { key, value } as IBotConfig;
      } else {
        // Create new config
        const result = await collection.insertOne({ key, value });
        return { key, value, _id: result.insertedId };
      }
    } catch (error: any) {
      addLogEntry('error', `Failed to set bot config: ${error.message}`);
      throw error;
    }
  }

  async getBotConfig(key: string): Promise<any> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.BOT_CONFIG);
      const config = await collection.findOne({ key });
      return config ? config.value : null;
    } catch (error: any) {
      addLogEntry('error', `Failed to get bot config: ${error.message}`);
      throw error;
    }
  }

  async getAllBotConfig(): Promise<IBotConfig[]> {
    try {
      const collection = this.db.collection(COLLECTION_NAMES.BOT_CONFIG);
      return await collection.find().toArray() as IBotConfig[];
    } catch (error: any) {
      addLogEntry('error', `Failed to get all bot config: ${error.message}`);
      throw error;
    }
  }
}