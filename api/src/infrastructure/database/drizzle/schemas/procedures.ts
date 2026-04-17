import { pgTable, uuid, varchar, numeric } from 'drizzle-orm/pg-core';

export const procedures = pgTable('procedures', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
});
