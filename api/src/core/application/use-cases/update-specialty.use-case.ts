import { Inject, Injectable } from '@nestjs/common';
import { SPECIALTY_REPOSITORY } from '@/core/domain/interfaces/specialty-repository.interface';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

interface UpdateSpecialtyInput {
  id: string;
  code?: string;
  name?: string;
}

@Injectable()
export class UpdateSpecialtyUseCase {
  constructor(
    @Inject(SPECIALTY_REPOSITORY) private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(input: UpdateSpecialtyInput): Promise<SpecialtyEntity> {
    const existing = await this.specialtyRepository.findById(input.id);
    if (!existing) throw new ResourceNotFoundError('Specialty', input.id);

    const { id, ...data } = input;
    return this.specialtyRepository.update(id, data);
  }
}
