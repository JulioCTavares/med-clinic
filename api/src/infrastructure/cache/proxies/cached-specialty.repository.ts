import { Inject, Injectable } from '@nestjs/common';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import type { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';

const TTL_LIST = 3600;
const TTL_ITEM = 1800;

@Injectable()
export class CachedSpecialtyRepository implements ISpecialtyRepository {
  constructor(
    private readonly real: ISpecialtyRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async findAll(): Promise<SpecialtyEntity[]> {
    const cached = await this.cache.get(CacheKeys.especialidadeList());
    if (cached) return JSON.parse(cached) as SpecialtyEntity[];

    const entities = await this.real.findAll();
    await this.cache.set(CacheKeys.especialidadeList(), JSON.stringify(entities), TTL_LIST);
    return entities;
  }

  async findById(id: string): Promise<SpecialtyEntity | null> {
    const cached = await this.cache.get(CacheKeys.especialidade(id));
    if (cached) return JSON.parse(cached) as SpecialtyEntity;

    const entity = await this.real.findById(id);
    if (entity) {
      await this.cache.set(CacheKeys.especialidade(id), JSON.stringify(entity), TTL_ITEM);
    }
    return entity;
  }

  async create(specialty: SpecialtyEntity): Promise<SpecialtyEntity> {
    const result = await this.real.create(specialty);
    await this.cache.del(CacheKeys.especialidadeList());
    return result;
  }

  async update(id: string, data: Partial<Pick<SpecialtyEntity, 'code' | 'name'>>): Promise<SpecialtyEntity> {
    const result = await this.real.update(id, data);
    await Promise.all([
      this.cache.del(CacheKeys.especialidade(id)),
      this.cache.del(CacheKeys.especialidadeList()),
    ]);
    return result;
  }

  async softDelete(id: string): Promise<void> {
    await this.real.softDelete(id);
    await Promise.all([
      this.cache.del(CacheKeys.especialidade(id)),
      this.cache.del(CacheKeys.especialidadeList()),
    ]);
  }
}
