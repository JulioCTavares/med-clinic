import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';

@Injectable()
export class RedisService implements ICacheService {
  private readonly keyPrefix: string;

  constructor(
    private readonly redis: Redis,
    configService: ConfigService,
  ) {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const databaseUrl = configService.get<string>('DATABASE_URL', '');
    const dbName = this.extractDbName(databaseUrl);
    this.keyPrefix = `medclinic:${nodeEnv}:${dbName}`;
  }

  private extractDbName(databaseUrl: string): string {
    try {
      if (!databaseUrl) return 'unknown-db';
      const parsed = new URL(databaseUrl);
      return parsed.pathname.replace(/^\//, '') || 'unknown-db';
    } catch {
      return 'unknown-db';
    }
  }

  private scoped(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const scopedKey = this.scoped(key);
    if (ttl !== undefined) {
      await this.redis.set(scopedKey, value, 'EX', ttl);
    } else {
      await this.redis.set(scopedKey, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(this.scoped(key));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.scoped(key));
  }
}
