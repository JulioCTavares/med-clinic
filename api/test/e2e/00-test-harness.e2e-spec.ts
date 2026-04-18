import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { eq, inArray, sql } from 'drizzle-orm';
import { AppModule } from '@/app.module';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import { specialties } from '@/infrastructure/database/drizzle/schemas/specialties';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';

/** Deve coincidir com `src/infrastructure/database/drizzle/migrations/meta/_journal.json`. */
const EXPECTED_APPLIED_MIGRATIONS = 2;

function getPgPool(database: DrizzleDB): Pool {
  return (database as unknown as { $client: Pool }).$client;
}

describe('E2E P0 - Test Harness', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  const harnessSpecialtyIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    db = app.get<DrizzleDB>(DRIZZLE_DB);

    await app.init();
    await (app as NestFastifyApplication).getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (harnessSpecialtyIds.length > 0) {
      await db.delete(specialties).where(inArray(specialties.id, harnessSpecialtyIds));
    }
    await app.close();
  });

  it('should boot the application in test environment', async () => {
    expect(process.env.NODE_ENV).toBe('test');

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `harness.${randomUUID().slice(0, 8)}@e2e.test`,
        password: 'WrongPassword1!',
      })
      .expect(401);
  });

  it('should run migrations before the E2E suite', async () => {
    const pool = getPgPool(db);
    const { rows } = await pool.query<{ c: string }>(
      'select count(*)::text as c from drizzle.__drizzle_migrations',
    );
    expect(Number(rows[0]?.c)).toBeGreaterThanOrEqual(EXPECTED_APPLIED_MIGRATIONS);

    await db.execute(sql`select 1 from specialties limit 1`);
    await db.execute(sql`select 1 from users limit 1`);
  });

  it('should isolate data between scenarios (first scenario)', async () => {
    const suffix = randomUUID().slice(0, 8);
    const [row] = await db
      .insert(specialties)
      .values({
        code: `HARNESS-1-${suffix}`,
        name: `Harness 1 ${suffix}`,
      })
      .returning({ id: specialties.id });
    harnessSpecialtyIds.push(row.id);

    const found = await db.select().from(specialties).where(eq(specialties.id, row.id));
    expect(found).toHaveLength(1);
    expect(found[0].code).toBe(`HARNESS-1-${suffix}`);
  });

  it('should isolate data between scenarios (second scenario)', async () => {
    const suffix = randomUUID().slice(0, 8);
    const [row] = await db
      .insert(specialties)
      .values({
        code: `HARNESS-2-${suffix}`,
        name: `Harness 2 ${suffix}`,
      })
      .returning({ id: specialties.id });
    harnessSpecialtyIds.push(row.id);

    const found = await db.select().from(specialties).where(eq(specialties.id, row.id));
    expect(found).toHaveLength(1);
    expect(found[0].code).toBe(`HARNESS-2-${suffix}`);
  });
});
