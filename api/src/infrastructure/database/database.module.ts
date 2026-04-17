import { Module, Global, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/infrastructure/database/drizzle/schemas';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');
export const DRIZZLE_POOL = Symbol('DRIZZLE_POOL');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool => {
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
        return new Pool({ connectionString: databaseUrl });
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [DRIZZLE_POOL],
      useFactory: (pool: Pool): DrizzleDB => {
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DRIZZLE_POOL) private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
