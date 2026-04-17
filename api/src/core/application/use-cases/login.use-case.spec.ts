import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginUseCase } from './login.use-case';
import type { IUserRepository } from '@/core/domain/interfaces/user-repository.interface';
import type { IHashingAdapter } from '@/core/domain/interfaces/hashing.interface';
import type { ITokenService } from '@/core/domain/interfaces/token-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { UserEntity } from '@/core/domain/entities/user.entity';
import { Role } from '@/core/domain/enums/role.enum';
import { InvalidCredentialsError } from '@/core/application/errors/application.error';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

const makeUser = () =>
  UserEntity.builder()
    .id('user-uuid')
    .email('medico@clinica.com')
    .passwordHash('$argon2id$hashed')
    .role(Role.DOCTOR)
    .build();

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepo: import('vitest').Mocked<IUserRepository>;
  let hashing: import('vitest').Mocked<IHashingAdapter>;
  let accessTokenService: import('vitest').Mocked<ITokenService>;
  let refreshTokenService: import('vitest').Mocked<ITokenService>;
  let cache: import('vitest').Mocked<ICacheService>;

  beforeEach(() => {
    userRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    hashing = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

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

    useCase = new LoginUseCase(userRepo, hashing, accessTokenService, refreshTokenService, cache);
  });

  describe('onModuleInit', () => {
    it('should pre-compute the dummy hash for timing protection', async () => {
      hashing.hash.mockResolvedValue('computed_dummy');

      await useCase.onModuleInit();

      expect(hashing.hash).toHaveBeenCalledWith('__dummy_init__');
    });
  });

  describe('execute — success', () => {
    beforeEach(() => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      hashing.compare.mockResolvedValue(true);
      accessTokenService.generateToken.mockResolvedValue('access.jwt.token');
      refreshTokenService.generateToken.mockResolvedValue('refresh.jwt.token');
      cache.set.mockResolvedValue(undefined);
    });

    it('should return access_token and refresh_token', async () => {
      const result = await useCase.execute({ email: 'medico@clinica.com', password: 'Senha@123' });

      expect(result).toEqual({
        access_token: 'access.jwt.token',
        refresh_token: 'refresh.jwt.token',
      });
    });

    it('should verify password against the user passwordHash', async () => {
      const user = makeUser();
      userRepo.findByEmail.mockResolvedValue(user);

      await useCase.execute({ email: 'medico@clinica.com', password: 'Senha@123' });

      expect(hashing.compare).toHaveBeenCalledWith('Senha@123', user.passwordHash);
    });

    it('should generate JWT payload with sub, email, role and jti', async () => {
      const user = makeUser();
      userRepo.findByEmail.mockResolvedValue(user);

      await useCase.execute({ email: 'medico@clinica.com', password: 'Senha@123' });

      const [accessPayload] = accessTokenService.generateToken.mock.calls[0];
      expect(accessPayload).toMatchObject({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(typeof accessPayload.jti).toBe('string');
      expect(accessPayload.jti.length).toBeGreaterThan(0);
    });

    it('should use different jti for access token and refresh token', async () => {
      await useCase.execute({ email: 'medico@clinica.com', password: 'Senha@123' });

      const [accessPayload] = accessTokenService.generateToken.mock.calls[0];
      const [refreshPayload] = refreshTokenService.generateToken.mock.calls[0];

      expect(accessPayload.jti).not.toBe(refreshPayload.jti);
    });

    it('should store refresh token in Redis with 7-day TTL', async () => {
      const user = makeUser();
      userRepo.findByEmail.mockResolvedValue(user);

      await useCase.execute({ email: 'medico@clinica.com', password: 'Senha@123' });

      expect(cache.set).toHaveBeenCalledWith(
        `refresh:${user.id}`,
        'refresh.jwt.token',
        REFRESH_TOKEN_TTL,
      );
    });
  });

  describe('execute — invalid credentials', () => {
    it('should throw InvalidCredentialsError when user does not exist', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      hashing.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'notfound@clinica.com', password: 'any' }),
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError when password is wrong', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      hashing.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'medico@clinica.com', password: 'wrong_password' }),
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should not generate tokens when credentials are invalid', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      hashing.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'medico@clinica.com', password: 'wrong_password' }),
      ).rejects.toThrow(InvalidCredentialsError);

      expect(accessTokenService.generateToken).not.toHaveBeenCalled();
      expect(cache.set).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when compare throws (malformed hash)', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      hashing.compare.mockRejectedValue(new Error('malformed hash'));

      await expect(
        useCase.execute({ email: 'medico@clinica.com', password: 'any' }),
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('execute — timing attack protection', () => {
    it('should always call compare even when the user does not exist', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      hashing.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'notfound@clinica.com', password: 'any' }),
      ).rejects.toThrow(InvalidCredentialsError);

      expect(hashing.compare).toHaveBeenCalledOnce();
    });

    it('should use the dummy hash when user does not exist', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      hashing.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'notfound@clinica.com', password: 'any' }),
      ).rejects.toThrow(InvalidCredentialsError);

      // second argument to compare must be the dummy hash, never undefined
      const [, hashArg] = hashing.compare.mock.calls[0];
      expect(typeof hashArg).toBe('string');
      expect(hashArg.length).toBeGreaterThan(0);
    });
  });
});
