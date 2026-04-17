import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ITokenService, JwtTokenPayload } from '@/core/domain/interfaces/token-service.interface';
import { ACCESS_TOKEN_SERVICE, REFRESH_TOKEN_SERVICE } from '@/core/domain/interfaces/token-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import { InvalidRefreshTokenError } from '@/core/application/errors/application.error';
import type { RefreshTokenDto } from '@/core/application/dtos/refresh-token.dto';
import type { LoginResult } from '@/core/application/use-cases/login.use-case';
import { CacheKeys } from '@/common/cache/cache-keys';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(ACCESS_TOKEN_SERVICE) private readonly accessTokenService: ITokenService,
    @Inject(REFRESH_TOKEN_SERVICE) private readonly refreshTokenService: ITokenService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<LoginResult> {
    let payload: JwtTokenPayload;

    try {
      payload = await this.refreshTokenService.decodeToken(dto.refresh_token);
    } catch {
      throw new InvalidRefreshTokenError();
    }

    const blacklisted = await this.cache.get(CacheKeys.blacklist(payload.jti));
    if (blacklisted) throw new InvalidRefreshTokenError();

    const stored = await this.cache.get(`refresh:${payload.sub}`);
    if (!stored || stored !== dto.refresh_token) throw new InvalidRefreshTokenError();

    const newJti = randomUUID();
    const newPayload: JwtTokenPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: newJti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.accessTokenService.generateToken(newPayload),
      this.refreshTokenService.generateToken({ ...newPayload, jti: randomUUID() }),
    ]);

    await Promise.all([
      this.cache.set(CacheKeys.blacklist(payload.jti), '1', REFRESH_TOKEN_TTL_SECONDS),
      this.cache.set(`refresh:${payload.sub}`, refreshToken, REFRESH_TOKEN_TTL_SECONDS),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
