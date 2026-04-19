import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository, DoctorFilters } from '@/core/domain/interfaces/doctor-repository.interface';
import type { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';

const TTL_LIST = 300;
const TTL_ITEM = 600;

@Injectable()
export class CachedDoctorRepository implements IDoctorRepository {
  constructor(
    private readonly real: IDoctorRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async findAll(): Promise<DoctorEntity[]> {
    const cached = await this.cache.get(CacheKeys.medicoList());
    if (cached) return JSON.parse(cached) as DoctorEntity[];

    const entities = await this.real.findAll();
    await this.cache.set(CacheKeys.medicoList(), JSON.stringify(entities), TTL_LIST);
    return entities;
  }

  findPaginated(params: DoctorFilters): Promise<PaginatedResult<DoctorEntity>> {
    return this.real.findPaginated(params);
  }

  async findById(id: string): Promise<DoctorEntity | null> {
    const cached = await this.cache.get(CacheKeys.medico(id));
    if (cached) return JSON.parse(cached) as DoctorEntity;

    const entity = await this.real.findById(id);
    if (entity) {
      await this.cache.set(CacheKeys.medico(id), JSON.stringify(entity), TTL_ITEM);
    }
    return entity;
  }

  async create(doctor: DoctorEntity): Promise<DoctorEntity> {
    const result = await this.real.create(doctor);
    await this.cache.del(CacheKeys.medicoList());
    return result;
  }

  async update(id: string, data: Partial<Pick<DoctorEntity, 'name' | 'crm' | 'specialtyId'>>): Promise<DoctorEntity> {
    const result = await this.real.update(id, data);
    await Promise.all([
      this.cache.del(CacheKeys.medico(id)),
      this.cache.del(CacheKeys.medicoList()),
    ]);
    return result;
  }

  async softDelete(id: string): Promise<void> {
    await this.real.softDelete(id);
    await Promise.all([
      this.cache.del(CacheKeys.medico(id)),
      this.cache.del(CacheKeys.medicoList()),
    ]);
  }
}
