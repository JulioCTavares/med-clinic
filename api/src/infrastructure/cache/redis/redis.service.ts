import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';

@Injectable()
export class RedisService implements ICacheService {
  constructor(private readonly redis: Redis) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl !== undefined) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
