import { Inject, Injectable } from '@nestjs/common';
import { SPECIALTY_REPOSITORY } from '@/core/domain/interfaces/specialty-repository.interface';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';

@Injectable()
export class FindAllSpecialtiesUseCase {
  constructor(
    @Inject(SPECIALTY_REPOSITORY) private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  execute(): Promise<SpecialtyEntity[]> {
    return this.specialtyRepository.findAll();
  }
}
