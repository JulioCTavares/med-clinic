import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const specialties = pgTable('specialties', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
});
