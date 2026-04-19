import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { Public } from '@/infrastructure/security/decorators/public.decorator';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
    private readonly redis: Redis,
  ) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check da API e dependências' })
  @ApiOkResponse({ description: 'Status de saúde dos serviços.' })
  async check() {
    const [postgres, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    return {
      status: postgres.status === 'ok' && redis.status === 'ok' ? 'ok' : 'degraded',
      services: { postgres, redis },
    };
  }

  private async checkPostgres(): Promise<{ status: string }> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: 'ok' };
    } catch {
      return { status: 'error' };
    }
  }

  private async checkRedis(): Promise<{ status: string }> {
    try {
      const pong = await this.redis.ping();
      return { status: pong === 'PONG' ? 'ok' : 'error' };
    } catch {
      return { status: 'error' };
    }
  }
}
