import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedHealthPlanRepository } from './cached-health-plan.repository';
import type { IHealthPlanRepository, HealthPlanFilters } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { CacheKeys } from '@/common/cache/cache-keys';

const makeHealthPlan = (id = 'plan-uuid') =>
  HealthPlanEntity.create({
    id,
    code: 'PLAN-001',
    description: 'Plano Básico',
    phone: '(11) 9999-0000',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const makePaginated = (data: HealthPlanEntity[]): PaginatedResult<HealthPlanEntity> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('CachedHealthPlanRepository', () => {
  let proxy: CachedHealthPlanRepository;
  let real: import('vitest').Mocked<IHealthPlanRepository>;
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
    proxy = new CachedHealthPlanRepository(real, cache);
  });

  describe('findAll', () => {
    it('returns cached value without hitting the real repo', async () => {
      const plans = [makeHealthPlan()];
      const serialized = JSON.stringify(plans);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findAll();

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.planoList());
      expect(real.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const plans = [makeHealthPlan()];
      cache.get.mockResolvedValue(null);
      real.findAll.mockResolvedValue(plans);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findAll();

      expect(real.findAll).toHaveBeenCalledOnce();
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.planoList(),
        JSON.stringify(plans),
        1800,
      );
      expect(result).toEqual(plans);
    });
  });

  describe('findPaginated', () => {
    it('delegates directly to real repo without caching', async () => {
      const params: HealthPlanFilters = { page: 1, limit: 10 };
      const paginated = makePaginated([makeHealthPlan()]);
      real.findPaginated.mockResolvedValue(paginated);

      const result = await proxy.findPaginated(params);

      expect(real.findPaginated).toHaveBeenCalledWith(params);
      expect(cache.get).not.toHaveBeenCalled();
      expect(result).toEqual(paginated);
    });
  });

  describe('findById', () => {
    it('returns cached value without hitting the real repo', async () => {
      const plan = makeHealthPlan();
      const serialized = JSON.stringify(plan);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findById('plan-uuid');

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.plano('plan-uuid'));
      expect(real.findById).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const plan = makeHealthPlan();
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(plan);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findById('plan-uuid');

      expect(real.findById).toHaveBeenCalledWith('plan-uuid');
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.plano('plan-uuid'),
        JSON.stringify(plan),
        1800,
      );
      expect(result).toEqual(plan);
    });

    it('does not store null in cache when health plan is not found', async () => {
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(null);

      const result = await proxy.findById('missing-uuid');

      expect(cache.set).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('delegates to real repo and invalidates list cache', async () => {
      const plan = makeHealthPlan();
      real.create.mockResolvedValue(plan);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.create(plan);

      expect(real.create).toHaveBeenCalledWith(plan);
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.planoList());
      expect(result).toEqual(plan);
    });
  });

  describe('update', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      const plan = makeHealthPlan();
      real.update.mockResolvedValue(plan);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.update('plan-uuid', { description: 'Plano Premium' });

      expect(real.update).toHaveBeenCalledWith('plan-uuid', { description: 'Plano Premium' });
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.plano('plan-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.planoList());
      expect(result).toEqual(plan);
    });
  });

  describe('softDelete', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      real.softDelete.mockResolvedValue(undefined);
      cache.del.mockResolvedValue(undefined);

      await proxy.softDelete('plan-uuid');

      expect(real.softDelete).toHaveBeenCalledWith('plan-uuid');
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.plano('plan-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.planoList());
    });
  });
});
