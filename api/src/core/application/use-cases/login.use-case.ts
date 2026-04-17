import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IUserRepository } from '@/core/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '@/core/domain/interfaces/user-repository.interface';
import type { IHashingAdapter } from '@/core/domain/interfaces/hashing.interface';
import { HASHING_ADAPTER } from '@/core/domain/interfaces/hashing.interface';
import type { ITokenService, JwtTokenPayload } from '@/core/domain/interfaces/token-service.interface';
import { ACCESS_TOKEN_SERVICE, REFRESH_TOKEN_SERVICE } from '@/core/domain/interfaces/token-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import { InvalidCredentialsError } from '@/core/application/errors/application.error';
import { LoginDto } from '@/core/application/dtos/login.dto';

// Hash dummy estruturalmente válido (argon2id, m=65536, t=3, p=4).
// Garante que argon2.verify execute a computação completa mesmo quando o usuário
// não existe, evitando enumeração de usuários por diferença de tempo de resposta.
const TIMING_SAFE_DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$YWJjZGVmZ2hpamtsbW5vcA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

export interface LoginResult {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class LoginUseCase implements OnModuleInit {
  // Substituído em onModuleInit para evitar undefined na primeira chamada
  private dummyHash = TIMING_SAFE_DUMMY_HASH;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(HASHING_ADAPTER) private readonly hashing: IHashingAdapter,
    @Inject(ACCESS_TOKEN_SERVICE) private readonly accessTokenService: ITokenService,
    @Inject(REFRESH_TOKEN_SERVICE) private readonly refreshTokenService: ITokenService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async onModuleInit() {
    // Pre-computa hash válido para substituir o dummy estático em runtime
    this.dummyHash = await this.hashing.hash('__dummy_init__');
  }

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(dto.email);

    // Sempre executa o compare — evita timing attack por enumeração de usuário
    const hashToVerify = user?.passwordHash ?? this.dummyHash;
    const validPassword = await this.hashing
      .compare(dto.password, hashToVerify)
      .catch(() => false);

    if (!user || !validPassword) {
      throw new InvalidCredentialsError();
    }

    const jti = randomUUID();

    const payload: JwtTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.accessTokenService.generateToken(payload),
      this.refreshTokenService.generateToken({ ...payload, jti: randomUUID() }),
    ]);

    // Armazena refresh token no Redis com TTL de 7 dias
    await this.cache.set(`refresh:${user.id}`, refreshToken, REFRESH_TOKEN_TTL_SECONDS);

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
