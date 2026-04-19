import { Inject, Injectable } from '@nestjs/common';
import { SPECIALTY_REPOSITORY } from '@/core/domain/interfaces/specialty-repository.interface';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class DeleteSpecialtyUseCase {
  constructor(
    @Inject(SPECIALTY_REPOSITORY) private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.specialtyRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError('Specialty', id);
    await this.specialtyRepository.softDelete(id);
  }
}
