import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogoutUseCase } from './logout.use-case';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let cache: import('vitest').Mocked<ICacheService>;

  beforeEach(() => {
    cache = {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    };

    useCase = new LogoutUseCase(cache);
  });

  it('should blacklist jti with remaining TTL and remove refresh token', async () => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 120;

    await useCase.execute({
      userId: 'user-uuid',
      jti: 'access-jti',
      exp,
    });

    expect(cache.set).toHaveBeenCalledWith('blacklist:access-jti', '1', expect.any(Number));
    const [, , ttl] = cache.set.mock.calls[0];
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(120);
    expect(cache.del).toHaveBeenCalledWith('refresh:user-uuid');
  });

  it('should not blacklist when token is already expired', async () => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now - 10;

    await useCase.execute({
      userId: 'user-uuid',
      jti: 'expired-jti',
      exp,
    });

    expect(cache.set).not.toHaveBeenCalled();
    expect(cache.del).toHaveBeenCalledWith('refresh:user-uuid');
  });
});
