import { pgTable, uuid, varchar, date, time, boolean } from 'drizzle-orm/pg-core';
import { patients } from '@/infrastructure/database/drizzle/schemas/patients';
import { doctors } from '@/infrastructure/database/drizzle/schemas/doctors';

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  date: date('date').notNull(),
  time: time('time').notNull(),
  isPrivate: boolean('is_private').notNull().default(false),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
});
