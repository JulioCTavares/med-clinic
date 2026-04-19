import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedDoctorRepository } from './cached-doctor.repository';
import type { IDoctorRepository, DoctorFilters } from '@/core/domain/interfaces/doctor-repository.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { CacheKeys } from '@/common/cache/cache-keys';

const makeDoctor = (id = 'doctor-uuid') =>
  DoctorEntity.create({
    id,
    userId: 'user-uuid',
    name: 'Dr. João',
    crm: 'CRM-12345',
    specialtyId: 'spec-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const makePaginated = (data: DoctorEntity[]): PaginatedResult<DoctorEntity> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('CachedDoctorRepository', () => {
  let proxy: CachedDoctorRepository;
  let real: import('vitest').Mocked<IDoctorRepository>;
  let cache: import('vitest').Mocked<ICacheService>;

  beforeEach(() => {
    real = {
      findAll: vi.fn(),
      findPaginated: vi.fn(),
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
    proxy = new CachedDoctorRepository(real, cache);
  });

  describe('findAll', () => {
    it('returns cached value without hitting the real repo', async () => {
      const doctors = [makeDoctor()];
      const serialized = JSON.stringify(doctors);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findAll();

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.medicoList());
      expect(real.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const doctors = [makeDoctor()];
      cache.get.mockResolvedValue(null);
      real.findAll.mockResolvedValue(doctors);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findAll();

      expect(real.findAll).toHaveBeenCalledOnce();
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.medicoList(),
        JSON.stringify(doctors),
        300,
      );
      expect(result).toEqual(doctors);
    });
  });

  describe('findPaginated', () => {
    it('delegates directly to real repo without caching', async () => {
      const params: DoctorFilters = { page: 1, limit: 10 };
      const paginated = makePaginated([makeDoctor()]);
      real.findPaginated.mockResolvedValue(paginated);

      const result = await proxy.findPaginated(params);

      expect(real.findPaginated).toHaveBeenCalledWith(params);
      expect(cache.get).not.toHaveBeenCalled();
      expect(result).toEqual(paginated);
    });
  });

  describe('findById', () => {
    it('returns cached value without hitting the real repo', async () => {
      const doctor = makeDoctor();
      const serialized = JSON.stringify(doctor);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findById('doctor-uuid');

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.medico('doctor-uuid'));
      expect(real.findById).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const doctor = makeDoctor();
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(doctor);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findById('doctor-uuid');

      expect(real.findById).toHaveBeenCalledWith('doctor-uuid');
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.medico('doctor-uuid'),
        JSON.stringify(doctor),
        600,
      );
      expect(result).toEqual(doctor);
    });

    it('does not store null in cache when doctor is not found', async () => {
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(null);

      const result = await proxy.findById('missing-uuid');

      expect(cache.set).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('delegates to real repo and invalidates list cache', async () => {
      const doctor = makeDoctor();
      real.create.mockResolvedValue(doctor);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.create(doctor);

      expect(real.create).toHaveBeenCalledWith(doctor);
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.medicoList());
      expect(result).toEqual(doctor);
    });
  });

  describe('update', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      const doctor = makeDoctor();
      real.update.mockResolvedValue(doctor);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.update('doctor-uuid', { name: 'Dr. Pedro' });

      expect(real.update).toHaveBeenCalledWith('doctor-uuid', { name: 'Dr. Pedro' });
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.medico('doctor-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.medicoList());
      expect(result).toEqual(doctor);
    });
  });

  describe('softDelete', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      real.softDelete.mockResolvedValue(undefined);
      cache.del.mockResolvedValue(undefined);

      await proxy.softDelete('doctor-uuid');

      expect(real.softDelete).toHaveBeenCalledWith('doctor-uuid');
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.medico('doctor-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.medicoList());
    });
  });
});
