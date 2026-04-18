import { isNull, type SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

export const active = (table: { deletedAt: PgColumn }): SQL =>
  isNull(table.deletedAt);
