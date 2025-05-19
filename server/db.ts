import { MongoClient, Db } from 'mongodb';
import { addLogEntry } from './handlers/events';

let db: Db | null = null;
let client: MongoClient | null = null;

/**
 * Connect to MongoDB
 * Uses environment variable MONGODB_URI if available, otherwise uses in-memory MongoDB
 */
export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  try {
    // Check for MongoDB URI in environment variables
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-bot';
    
    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db();
    
    // Test the connection
    await db.command({ ping: 1 });
    addLogEntry('success', 'Connected to MongoDB database');
    
    return db;
  } catch (error: any) {
    addLogEntry('error', `Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
}

/**
 * Get database instance
 */
export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    addLogEntry('info', 'Closed MongoDB connection');
  }
}

// Collections
export const COLLECTION_NAMES = {
  SERVERS: 'servers',
  ROLES: 'roles',
  DM_LOGS: 'dm_logs',
  BOT_CONFIG: 'bot_config'
};