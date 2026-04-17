import { pgTable, uuid, varchar, date, text } from 'drizzle-orm/pg-core';
import { users } from './users';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  birthDate: date('birth_date'),
  phones: text('phones').array(),
});
