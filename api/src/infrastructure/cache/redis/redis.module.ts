import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from '@/infrastructure/cache/redis/redis.service';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        }),
    },
    RedisService,
    { provide: CACHE_SERVICE, useExisting: RedisService },
  ],
  exports: [CACHE_SERVICE, RedisService, Redis],
})
export class RedisModule {}
