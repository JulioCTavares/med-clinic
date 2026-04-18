import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedProcedureRepository } from './cached-procedure.repository';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import { CacheKeys } from '@/common/cache/cache-keys';

const makeProcedure = (id = 'proc-uuid') =>
  ProcedureEntity.create({
    id,
    code: 'PROC-001',
    name: 'Eletrocardiograma',
    value: 150.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('CachedProcedureRepository', () => {
  let proxy: CachedProcedureRepository;
  let real: import('vitest').Mocked<IProcedureRepository>;
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
    proxy = new CachedProcedureRepository(real, cache);
  });

  describe('findAll', () => {
    it('returns cached value without hitting the real repo', async () => {
      const procedures = [makeProcedure()];
      const serialized = JSON.stringify(procedures);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findAll();

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.procedimentoList());
      expect(real.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const procedures = [makeProcedure()];
      cache.get.mockResolvedValue(null);
      real.findAll.mockResolvedValue(procedures);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findAll();

      expect(real.findAll).toHaveBeenCalledOnce();
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.procedimentoList(),
        JSON.stringify(procedures),
        1800,
      );
      expect(result).toEqual(procedures);
    });
  });

  describe('findById', () => {
    it('returns cached value without hitting the real repo', async () => {
      const procedure = makeProcedure();
      const serialized = JSON.stringify(procedure);
      cache.get.mockResolvedValue(serialized);

      const result = await proxy.findById('proc-uuid');

      expect(cache.get).toHaveBeenCalledWith(CacheKeys.procedimento('proc-uuid'));
      expect(real.findById).not.toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('queries real repo on cache miss and stores result', async () => {
      const procedure = makeProcedure();
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(procedure);
      cache.set.mockResolvedValue(undefined);

      const result = await proxy.findById('proc-uuid');

      expect(real.findById).toHaveBeenCalledWith('proc-uuid');
      expect(cache.set).toHaveBeenCalledWith(
        CacheKeys.procedimento('proc-uuid'),
        JSON.stringify(procedure),
        1800,
      );
      expect(result).toEqual(procedure);
    });

    it('does not store null in cache when procedure is not found', async () => {
      cache.get.mockResolvedValue(null);
      real.findById.mockResolvedValue(null);

      const result = await proxy.findById('missing-uuid');

      expect(cache.set).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('delegates to real repo and invalidates list cache', async () => {
      const procedure = makeProcedure();
      real.create.mockResolvedValue(procedure);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.create(procedure);

      expect(real.create).toHaveBeenCalledWith(procedure);
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.procedimentoList());
      expect(result).toEqual(procedure);
    });
  });

  describe('update', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      const procedure = makeProcedure();
      real.update.mockResolvedValue(procedure);
      cache.del.mockResolvedValue(undefined);

      const result = await proxy.update('proc-uuid', { value: 200.0 });

      expect(real.update).toHaveBeenCalledWith('proc-uuid', { value: 200.0 });
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.procedimento('proc-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.procedimentoList());
      expect(result).toEqual(procedure);
    });
  });

  describe('softDelete', () => {
    it('delegates to real repo and invalidates item + list cache', async () => {
      real.softDelete.mockResolvedValue(undefined);
      cache.del.mockResolvedValue(undefined);

      await proxy.softDelete('proc-uuid');

      expect(real.softDelete).toHaveBeenCalledWith('proc-uuid');
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.procedimento('proc-uuid'));
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.procedimentoList());
    });
  });
});
