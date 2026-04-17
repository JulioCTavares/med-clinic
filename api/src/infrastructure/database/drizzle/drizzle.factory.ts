import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';

export type DrizzleDB = NodePgDatabase<typeof schema>;

export function createDrizzleConnection(databaseUrl: string): DrizzleDB {
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}
