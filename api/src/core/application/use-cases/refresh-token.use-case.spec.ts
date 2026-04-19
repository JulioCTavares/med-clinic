import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import type { ITokenService } from '@/core/domain/interfaces/token-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { InvalidRefreshTokenError } from '@/core/application/errors/application.error';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let accessTokenService: import('vitest').Mocked<ITokenService>;
  let refreshTokenService: import('vitest').Mocked<ITokenService>;
  let cache: import('vitest').Mocked<ICacheService>;

  beforeEach(() => {
    accessTokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
      decodeToken: vi.fn(),
    };

    refreshTokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
      decodeToken: vi.fn(),
    };

    cache = {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    };

    useCase = new RefreshTokenUseCase(accessTokenService, refreshTokenService, cache);
  });

  it('should rotate tokens when refresh token is valid', async () => {
    const refreshToken = 'refresh.jwt.token';
    refreshTokenService.decodeToken.mockResolvedValue({
      sub: 'user-uuid',
      email: 'user@clinic.com',
      role: 'doctor',
      jti: 'old-refresh-jti',
    });
    cache.get.mockResolvedValueOnce(null).mockResolvedValueOnce(refreshToken);
    accessTokenService.generateToken.mockResolvedValue('new.access.token');
    refreshTokenService.generateToken.mockResolvedValue('new.refresh.token');
    cache.set.mockResolvedValue(undefined);

    const result = await useCase.execute({ refresh_token: refreshToken });

    expect(result).toEqual({
      access_token: 'new.access.token',
      refresh_token: 'new.refresh.token',
    });
    expect(cache.set).toHaveBeenCalledWith('blacklist:old-refresh-jti', '1', REFRESH_TOKEN_TTL);
    expect(cache.set).toHaveBeenCalledWith('refresh:user-uuid', 'new.refresh.token', REFRESH_TOKEN_TTL);
  });

  it('should generate different jti values for access and refresh tokens', async () => {
    const refreshToken = 'refresh.jwt.token';
    refreshTokenService.decodeToken.mockResolvedValue({
      sub: 'user-uuid',
      email: 'user@clinic.com',
      role: 'doctor',
      jti: 'old-refresh-jti',
    });
    cache.get.mockResolvedValueOnce(null).mockResolvedValueOnce(refreshToken);
    accessTokenService.generateToken.mockResolvedValue('new.access.token');
    refreshTokenService.generateToken.mockResolvedValue('new.refresh.token');
    cache.set.mockResolvedValue(undefined);

    await useCase.execute({ refresh_token: refreshToken });

    const [accessPayload] = accessTokenService.generateToken.mock.calls[0];
    const [refreshPayload] = refreshTokenService.generateToken.mock.calls[0];
    expect(accessPayload.jti).not.toBe(refreshPayload.jti);
  });

  it('should throw InvalidRefreshTokenError when decode fails', async () => {
    refreshTokenService.decodeToken.mockRejectedValue(new Error('invalid token'));

    await expect(useCase.execute({ refresh_token: 'bad.token' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
    expect(cache.get).not.toHaveBeenCalled();
    expect(accessTokenService.generateToken).not.toHaveBeenCalled();
  });

  it('should throw InvalidRefreshTokenError when token jti is blacklisted', async () => {
    refreshTokenService.decodeToken.mockResolvedValue({
      sub: 'user-uuid',
      email: 'user@clinic.com',
      role: 'doctor',
      jti: 'blacklisted-jti',
    });
    cache.get.mockResolvedValueOnce('1');

    await expect(useCase.execute({ refresh_token: 'refresh.jwt.token' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
    expect(accessTokenService.generateToken).not.toHaveBeenCalled();
  });

  it('should throw InvalidRefreshTokenError when there is no stored refresh token', async () => {
    refreshTokenService.decodeToken.mockResolvedValue({
      sub: 'user-uuid',
      email: 'user@clinic.com',
      role: 'doctor',
      jti: 'refresh-jti',
    });
    cache.get.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await expect(useCase.execute({ refresh_token: 'refresh.jwt.token' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
    expect(accessTokenService.generateToken).not.toHaveBeenCalled();
  });

  it('should throw InvalidRefreshTokenError when stored token differs', async () => {
    refreshTokenService.decodeToken.mockResolvedValue({
      sub: 'user-uuid',
      email: 'user@clinic.com',
      role: 'doctor',
      jti: 'refresh-jti',
    });
    cache.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('different.refresh.jwt.token');

    await expect(useCase.execute({ refresh_token: 'refresh.jwt.token' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
    expect(accessTokenService.generateToken).not.toHaveBeenCalled();
  });
});
