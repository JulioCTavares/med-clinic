import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

export const SPECIALTY_REPOSITORY = Symbol('ISpecialtyRepository');

export interface SpecialtyFilters {
  name?: string;
  code?: string;
  page: number;
  limit: number;
}

export interface ISpecialtyRepository {
  findAll(): Promise<SpecialtyEntity[]>;
  findPaginated(params: SpecialtyFilters): Promise<PaginatedResult<SpecialtyEntity>>;
  findById(id: string): Promise<SpecialtyEntity | null>;
  create(specialty: SpecialtyEntity): Promise<SpecialtyEntity>;
  update(id: string, data: Partial<Pick<SpecialtyEntity, 'code' | 'name'>>): Promise<SpecialtyEntity>;
  softDelete(id: string): Promise<void>;
}
