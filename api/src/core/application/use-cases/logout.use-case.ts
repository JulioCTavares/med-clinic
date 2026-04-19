import { Inject, Injectable } from '@nestjs/common';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';

export interface LogoutCommand {
  userId: string;
  jti: string;
  exp: number;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async execute(cmd: LogoutCommand): Promise<void> {
    const remainingTtl = Math.max(0, cmd.exp - Math.floor(Date.now() / 1000));

    await Promise.all([
      remainingTtl > 0
        ? this.cache.set(CacheKeys.blacklist(cmd.jti), '1', remainingTtl)
        : Promise.resolve(),
      this.cache.del(`refresh:${cmd.userId}`),
    ]);
  }
}
