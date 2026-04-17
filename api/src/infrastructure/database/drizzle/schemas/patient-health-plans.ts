import { pgTable, uuid, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { healthPlans } from './health-plans';

export const patientHealthPlans = pgTable(
  'patient_health_plans',
  {
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    healthPlanId: uuid('health_plan_id')
      .notNull()
      .references(() => healthPlans.id, { onDelete: 'cascade' }),
    contractNumber: varchar('contract_number', { length: 100 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.patientId, t.healthPlanId] })],
);
