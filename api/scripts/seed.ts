/**
 * Seed idempotente — popula o banco com dados de desenvolvimento.
 * Execução: pnpm seed  (ou: npx ts-node -r tsconfig-paths/register scripts/seed.ts)
 *
 * Credenciais de teste:
 *   Paciente 1: maria.silva@test.com  / Senha@123
 *   Paciente 2: pedro.lima@test.com   / Senha@123
 *   Admin:      admin@medclinic.com   / Admin@123
 */

import 'dotenv/config';
import * as argon2 from 'argon2';
import Redis from 'ioredis';
import { createDrizzleConnection } from '@/infrastructure/database/drizzle/drizzle.factory';
import {
  users,
  patients,
  specialties,
  doctors,
  healthPlans,
  procedures,
  appointments,
  appointmentProcedures,
  patientHealthPlans,
} from '@/infrastructure/database/drizzle/schemas';
import { sql } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não definida. Copie .env.example para .env e preencha.');
  process.exit(1);
}

const { db, pool } = createDrizzleConnection(DATABASE_URL);
const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379);

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function hashPassword(password: string) {
  return argon2.hash(password);
}

function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// ──────────────────────────────────────────────
// Seed data
// ──────────────────────────────────────────────

async function seedSpecialties() {
  console.log('→ Especialidades…');
  const data = [
    { code: 'CARDIO', name: 'Cardiologia' },
    { code: 'ORTHO', name: 'Ortopedia' },
    { code: 'DERM', name: 'Dermatologia' },
    { code: 'NEURO', name: 'Neurologia' },
    { code: 'PEDI', name: 'Pediatria' },
    { code: 'GINEC', name: 'Ginecologia' },
  ];
  await db.insert(specialties).values(data).onConflictDoNothing();
  const rows = await db.select().from(specialties);
  return Object.fromEntries(rows.map((r) => [r.code, r.id]));
}

async function seedHealthPlans() {
  console.log('→ Planos de saúde…');
  const data = [
    { code: 'UNIMED', description: 'Unimed Nacional — cobertura ampla', phone: '0800 722 4848' },
    { code: 'BRADESCO', description: 'Bradesco Saúde — plano empresarial', phone: '0800 722 1100' },
    { code: 'AMIL', description: 'Amil — plano individual e familiar', phone: '0800 722 2645' },
    { code: 'SULAMERICA', description: 'SulAmérica Saúde — rede credenciada nacional', phone: '0800 722 0707' },
  ];
  await db.insert(healthPlans).values(data).onConflictDoNothing();
  const rows = await db.select().from(healthPlans);
  return Object.fromEntries(rows.map((r) => [r.code, r.id]));
}

async function seedProcedures() {
  console.log('→ Procedimentos…');
  const data = [
    { code: 'ECG', name: 'Eletrocardiograma', value: '180.00' },
    { code: 'ECO', name: 'Ecocardiograma', value: '350.00' },
    { code: 'RAIO-X', name: 'Raio-X Digital', value: '120.00' },
    { code: 'DENSIT', name: 'Densitometria Óssea', value: '200.00' },
    { code: 'DERM-BIOP', name: 'Biopsia Dermatológica', value: '280.00' },
  ];
  await db.insert(procedures).values(data).onConflictDoNothing();
}

async function clearDatabase() {
  console.log('→ Limpando banco…');
  await db.transaction(async (tx) => {
    await tx.delete(appointmentProcedures);
    await tx.delete(appointments);
    await tx.delete(patientHealthPlans);
    await tx.delete(doctors);
    await tx.delete(patients);
    await tx.delete(procedures);
    await tx.delete(healthPlans);
    await tx.delete(specialties);
    await tx.delete(users);
    await tx.execute(sql`select 1`);
  });
}

async function clearCatalogCache() {
  const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, lazyConnect: true });
  try {
    console.log('→ Limpando cache Redis do catálogo…');
    await redis.connect();
    const keyPatterns = [
      'medico:*',
      'especialidade:*',
      'procedimento:*',
      'plano:*',
      'medclinic:*:medico:*',
      'medclinic:*:especialidade:*',
      'medclinic:*:procedimento:*',
      'medclinic:*:plano:*',
    ];
    const keyGroups = await Promise.all(keyPatterns.map((pattern) => redis.keys(pattern)));
    const keys = keyGroups.flat();
    const listKeys = [
      'medico:list',
      'especialidade:list',
      'procedimento:list',
      'plano:list',
      'medclinic:development:med_clinic_db:medico:list',
      'medclinic:development:med_clinic_db:especialidade:list',
      'medclinic:development:med_clinic_db:procedimento:list',
      'medclinic:development:med_clinic_db:plano:list',
      'medclinic:test:med_clinic_e2e:medico:list',
      'medclinic:test:med_clinic_e2e:especialidade:list',
      'medclinic:test:med_clinic_e2e:procedimento:list',
      'medclinic:test:med_clinic_e2e:plano:list',
    ];
    const toDelete = [...new Set([...keys, ...listKeys])];
    if (toDelete.length > 0) {
      await redis.del(...toDelete);
    }
  } catch (error) {
    console.warn('⚠ Não foi possível limpar cache Redis do catálogo:', error);
  } finally {
    redis.disconnect();
  }
}

async function seedDoctors(specialtyIds: Record<string, string>) {
  console.log('→ Médicos…');

  const doctorSeed = [
    { specialtyCode: 'CARDIO', specialtyLabel: 'Cardio' },
    { specialtyCode: 'ORTHO', specialtyLabel: 'Ortho' },
    { specialtyCode: 'DERM', specialtyLabel: 'Derm' },
    { specialtyCode: 'NEURO', specialtyLabel: 'Neuro' },
    { specialtyCode: 'PEDI', specialtyLabel: 'Pedi' },
    { specialtyCode: 'GINEC', specialtyLabel: 'Ginec' },
  ].flatMap(({ specialtyCode, specialtyLabel }) =>
    Array.from({ length: 5 }, (_, index) => {
      const doctorNumber = index + 1;
      const suffix = `${specialtyCode.toLowerCase()}${doctorNumber}`;
      return {
        email: `dr.${suffix}@medclinic.com`,
        name: `Dr(a). ${specialtyLabel} ${doctorNumber}`,
        crm: `CRM/${specialtyCode}-${doctorNumber.toString().padStart(4, '0')}`,
        specialtyCode,
      };
    }),
  );

  const passwordHash = await hashPassword('Senha@123');
  const doctorIds: Record<string, string> = {};

  for (const d of doctorSeed) {
    const [user] = await db
      .insert(users)
      .values({ email: d.email, passwordHash, role: 'doctor' })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      const existing = await db.select().from(users);
      const u = existing.find((u) => u.email === d.email);
      if (!u) continue;
      const existingDoctors = await db.select().from(doctors);
      const doc = existingDoctors.find((doc) => doc.userId === u.id);
      if (doc) doctorIds[d.crm] = doc.id;
      continue;
    }

    const [doctor] = await db
      .insert(doctors)
      .values({
        userId: user.id,
        name: d.name,
        crm: d.crm,
        specialtyId: specialtyIds[d.specialtyCode]!,
      })
      .onConflictDoNothing()
      .returning();

    if (doctor) doctorIds[d.crm] = doctor.id;
  }

  return doctorIds;
}

async function seedPatients() {
  console.log('→ Pacientes…');
  const passwordHash = await hashPassword('Senha@123');

  const patientSeed = [
    {
      email: 'maria.silva@test.com',
      name: 'Maria Silva',
      birthDate: '1990-05-15',
      phones: ['(11) 91234-5678'],
    },
    {
      email: 'pedro.lima@test.com',
      name: 'Pedro Lima',
      birthDate: '1985-11-22',
      phones: ['(21) 98765-4321', '(21) 3456-7890'],
    },
  ];

  const patientIds: Record<string, string> = {};

  for (const p of patientSeed) {
    const [user] = await db
      .insert(users)
      .values({ email: p.email, passwordHash, role: 'patient' })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      const existing = await db.select().from(users);
      const u = existing.find((u) => u.email === p.email);
      if (!u) continue;
      const existingPatients = await db.select().from(patients);
      const pat = existingPatients.find((pat) => pat.userId === u.id);
      if (pat) patientIds[p.email] = pat.id;
      continue;
    }

    const [patient] = await db
      .insert(patients)
      .values({
        userId: user.id,
        name: p.name,
        birthDate: p.birthDate,
        phones: p.phones,
      })
      .returning();

    if (patient) patientIds[p.email] = patient.id;
  }

  return patientIds;
}

async function seedAdmin() {
  console.log('→ Admin…');
  const passwordHash = await hashPassword('Admin@123');
  await db
    .insert(users)
    .values({ email: 'admin@medclinic.com', passwordHash, role: 'admin' })
    .onConflictDoNothing();
}

async function seedAppointments(
  patientIds: Record<string, string>,
  doctorIds: Record<string, string>,
) {
  console.log('→ Consultas…');

  const [p1, p2] = Object.values(patientIds);
  const [d1, d2, d3] = Object.values(doctorIds);

  if (!p1 || !d1) {
    console.log('  ⚠ Pulando consultas — pacientes ou médicos não encontrados.');
    return;
  }

  const appts = [
    // Futuras
    { code: 'APT-SEED-001', date: today(3), time: '09:00', isPrivate: false, status: 'pending' as const, patientId: p1, doctorId: d1 },
    { code: 'APT-SEED-002', date: today(7), time: '14:30', isPrivate: false, status: 'confirmed' as const, patientId: p1, doctorId: d2 ?? d1 },
    { code: 'APT-SEED-003', date: today(14), time: '11:00', isPrivate: true, status: 'pending' as const, patientId: p2 ?? p1, doctorId: d3 ?? d1 },
    // Passadas
    { code: 'APT-SEED-004', date: today(-30), time: '10:00', isPrivate: false, status: 'completed' as const, patientId: p1, doctorId: d1 },
    { code: 'APT-SEED-005', date: today(-15), time: '15:00', isPrivate: false, status: 'completed' as const, patientId: p2 ?? p1, doctorId: d2 ?? d1 },
    { code: 'APT-SEED-006', date: today(-7), time: '08:30', isPrivate: false, status: 'cancelled' as const, patientId: p1, doctorId: d1 },
  ];

  await db.insert(appointments).values(appts).onConflictDoNothing();
}

async function seedPatientHealthPlans(
  patientIds: Record<string, string>,
  planIds: Record<string, string>,
) {
  console.log('→ Vínculos paciente ↔ plano…');
  const [p1, p2] = Object.values(patientIds);
  const [planId1, planId2] = Object.values(planIds);

  if (!p1 || !planId1) return;

  const links = [
    ...(p1 && planId1 ? [{ patientId: p1, healthPlanId: planId1, contractNumber: 'UNIMED-2024-001' }] : []),
    ...(p1 && planId2 ? [{ patientId: p1, healthPlanId: planId2, contractNumber: 'BRADESCO-2024-001' }] : []),
    ...(p2 && planId1 ? [{ patientId: p2, healthPlanId: planId1, contractNumber: 'UNIMED-2024-002' }] : []),
  ];

  if (links.length) await db.insert(patientHealthPlans).values(links).onConflictDoNothing();
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  console.log('🌱  Iniciando seed…\n');

  await clearDatabase();
  await clearCatalogCache();
  const specialtyIds = await seedSpecialties();
  const planIds = await seedHealthPlans();
  await seedProcedures();
  await seedAdmin();
  const doctorIds = await seedDoctors(specialtyIds);
  const patientIds = await seedPatients();
  await seedAppointments(patientIds, doctorIds);
  await seedPatientHealthPlans(patientIds, planIds);

  console.log('\n✅  Seed concluído!');
  console.log('\nCredenciais de teste:');
  console.log('  Paciente 1: maria.silva@test.com  / Senha@123');
  console.log('  Paciente 2: pedro.lima@test.com   / Senha@123');
  console.log('  Admin:      admin@medclinic.com   / Admin@123');
}

main()
  .catch((err) => {
    console.error('❌  Erro no seed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
