import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/infrastructure/database/drizzle/schemas';

export type DrizzleDB = NodePgDatabase<typeof schema>;

export interface DrizzleConnection {
  db: DrizzleDB;
  pool: Pool;
}

export function createDrizzleConnection(databaseUrl: string): DrizzleConnection {
  const pool = new Pool({ connectionString: databaseUrl });
  return { db: drizzle(pool, { schema }), pool };
}
