import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

export const PROCEDURE_REPOSITORY = Symbol('IProcedureRepository');

export interface ProcedureFilters {
  name?: string;
  code?: string;
  page: number;
  limit: number;
}

export interface IProcedureRepository {
  findAll(): Promise<ProcedureEntity[]>;
  findPaginated(params: ProcedureFilters): Promise<PaginatedResult<ProcedureEntity>>;
  findById(id: string): Promise<ProcedureEntity | null>;
  create(procedure: ProcedureEntity): Promise<ProcedureEntity>;
  update(id: string, data: Partial<Pick<ProcedureEntity, 'code' | 'name' | 'value'>>): Promise<ProcedureEntity>;
  softDelete(id: string): Promise<void>;
}
