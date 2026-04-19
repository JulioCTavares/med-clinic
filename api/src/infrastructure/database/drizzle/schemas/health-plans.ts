import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const healthPlans = pgTable('health_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
