import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { specialties } from './specialties';

export const doctors = pgTable('doctors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  crm: varchar('crm', { length: 30 }).notNull().unique(),
  specialtyId: uuid('specialty_id')
    .notNull()
    .references(() => specialties.id),
});
