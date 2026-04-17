import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { appointments } from './appointments';
import { procedures } from './procedures';

export const appointmentProcedures = pgTable(
  'appointment_procedures',
  {
    appointmentId: uuid('appointment_id')
      .notNull()
      .references(() => appointments.id, { onDelete: 'cascade' }),
    procedureId: uuid('procedure_id')
      .notNull()
      .references(() => procedures.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.appointmentId, t.procedureId] })],
);
