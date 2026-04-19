import { Inject, Injectable } from '@nestjs/common';
import type { IProcedureRepository, ProcedureFilters } from '@/core/domain/interfaces/procedure-repository.interface';
import type { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';

const TTL = 1800;

@Injectable()
export class CachedProcedureRepository implements IProcedureRepository {
  constructor(
    private readonly real: IProcedureRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async findAll(): Promise<ProcedureEntity[]> {
    const cached = await this.cache.get(CacheKeys.procedimentoList());
    if (cached) return JSON.parse(cached) as ProcedureEntity[];

    const entities = await this.real.findAll();
    await this.cache.set(CacheKeys.procedimentoList(), JSON.stringify(entities), TTL);
    return entities;
  }

  findPaginated(params: ProcedureFilters): Promise<PaginatedResult<ProcedureEntity>> {
    return this.real.findPaginated(params);
  }

  async findById(id: string): Promise<ProcedureEntity | null> {
    const cached = await this.cache.get(CacheKeys.procedimento(id));
    if (cached) return JSON.parse(cached) as ProcedureEntity;

    const entity = await this.real.findById(id);
    if (entity) {
      await this.cache.set(CacheKeys.procedimento(id), JSON.stringify(entity), TTL);
    }
    return entity;
  }

  async create(procedure: ProcedureEntity): Promise<ProcedureEntity> {
    const result = await this.real.create(procedure);
    await this.cache.del(CacheKeys.procedimentoList());
    return result;
  }

  async update(id: string, data: Partial<Pick<ProcedureEntity, 'code' | 'name' | 'value'>>): Promise<ProcedureEntity> {
    const result = await this.real.update(id, data);
    await Promise.all([
      this.cache.del(CacheKeys.procedimento(id)),
      this.cache.del(CacheKeys.procedimentoList()),
    ]);
    return result;
  }

  async softDelete(id: string): Promise<void> {
    await this.real.softDelete(id);
    await Promise.all([
      this.cache.del(CacheKeys.procedimento(id)),
      this.cache.del(CacheKeys.procedimentoList()),
    ]);
  }
}
