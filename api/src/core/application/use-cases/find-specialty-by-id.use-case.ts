import { Inject, Injectable } from '@nestjs/common';
import { SPECIALTY_REPOSITORY } from '@/core/domain/interfaces/specialty-repository.interface';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class FindSpecialtyByIdUseCase {
  constructor(
    @Inject(SPECIALTY_REPOSITORY) private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(id: string): Promise<SpecialtyEntity> {
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) throw new ResourceNotFoundError('Specialty', id);
    return specialty;
  }
}
