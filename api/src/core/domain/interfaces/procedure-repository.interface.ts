import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';

export const PROCEDURE_REPOSITORY = Symbol('IProcedureRepository');

export interface IProcedureRepository {
  findAll(): Promise<ProcedureEntity[]>;
  findById(id: string): Promise<ProcedureEntity | null>;
  create(procedure: ProcedureEntity): Promise<ProcedureEntity>;
  update(id: string, data: Partial<Pick<ProcedureEntity, 'code' | 'name' | 'value'>>): Promise<ProcedureEntity>;
  softDelete(id: string): Promise<void>;
}
