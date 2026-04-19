import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedSpecialtyRepository } from './cached-specialty.repository';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { CacheKeys } from '@/common/cache/cache-keys';

const makeSpecialty = (id = 'spec-uuid') =>
  SpecialtyEntity.create({
    id,
    code: 'CARD-001',
    name: 'Cardiologia',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('CachedSpecialtyRepository', () => {
  let proxy: CachedSpecialtyRepository;
  let real: import('vitest').Mocked<ISpecialtyRepository>;
  let cache: import('vitest').Mocked<ICacheService>;

  beforeEach(() => {
    real = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    cache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };
    proxy = new CachedSpecialtyRepository(real, cache);
  });

  describe('findAll', () => {
    it('returns cached value without hitting the real repo', async () => {
      const specialties = [makeSpecialty()];
      const serialized = JSON.stringify(specialties);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findAll();

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.especialidadeList());
      expect(real.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const specialties = [makeSpecialty()];
      cache.get.mockResolvedValue(null);
      real.findAll.mockResolvedValue(specialties);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findAll();

      expect(real.findAll).toHaveBeenCalledOnce();
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.especialidadeList(),
        JSON.stringify(specialties),
        3600,
      );
      expect(result).toEqual(specialties);
    });
  });

  describe('findById', () => {
    it('returns cached value without hitting the real repo', async () => {
      const specialty = makeSpecialty();
      const serialized = JSON.stringify(specialty);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findById('spec-uuid');

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.especialidade('spec-uuid'));
      expect(real.findById).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const specialty = makeSpecialty();
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(specialty);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findById('spec-uuid');

      expect(real.findById).toHaveBeenCalledWith('spec-uuid');
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.especialidade('spec-uuid'),
        JSON.stringify(specialty),
        1800,
      );
      expect(result).toEqual(specialty);
    });

    it('does not store null in cache when specialty is not found', async () => {
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(null);

      const result = await proxy.findById('missing-uuid');

      expect(cache.set).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('delegates to real repo and invalidates list cache', async () => {
      const specialty = makeSpecialty();
      real.create.mockResolvedValue(specialty);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.create(specialty);

      expect(real.create).toHaveBeenCalledWith(specialty);
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.especialidadeList());
      expect(result).toEqual(specialty);
    });
  });

  describe('update', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      const specialty = makeSpecialty();
      real.update.mockResolvedValue(specialty);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.update('spec-uuid', { name: 'Neurologia' });

      expect(real.update).toHaveBeenCalledWith('spec-uuid', { name: 'Neurologia' });
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.especialidade('spec-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.especialidadeList());
      expect(result).toEqual(specialty);
    });
  });

  describe('softDelete', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      real.softDelete.mockResolvedValue(undefined);
      cache.del.mockResolvedValue(undefined);

      await proxy.softDelete('spec-uuid');

      expect(real.softDelete).toHaveBeenCalledWith('spec-uuid');
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.especialidade('spec-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.especialidadeList());
    });
  });
});
