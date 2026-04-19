import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';

export const SPECIALTY_REPOSITORY = Symbol('ISpecialtyRepository');

export interface ISpecialtyRepository {
  findAll(): Promise<SpecialtyEntity[]>;
  findById(id: string): Promise<SpecialtyEntity | null>;
  create(specialty: SpecialtyEntity): Promise<SpecialtyEntity>;
  update(id: string, data: Partial<Pick<SpecialtyEntity, 'code' | 'name'>>): Promise<SpecialtyEntity>;
  softDelete(id: string): Promise<void>;
}
