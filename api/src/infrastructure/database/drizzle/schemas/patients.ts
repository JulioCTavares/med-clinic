import { pgTable, uuid, varchar, date, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from '@/infrastructure/database/drizzle/schemas/users';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  birthDate: date('birth_date'),
  phones: text('phones').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
