import { Inject, Injectable } from '@nestjs/common';
import { SPECIALTY_REPOSITORY } from '@/core/domain/interfaces/specialty-repository.interface';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { randomUUID } from 'node:crypto';

interface CreateSpecialtyInput {
  code: string;
  name: string;
}

@Injectable()
export class CreateSpecialtyUseCase {
  constructor(
    @Inject(SPECIALTY_REPOSITORY) private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  execute(input: CreateSpecialtyInput): Promise<SpecialtyEntity> {
    const now = new Date();
    const specialty = SpecialtyEntity.create({
      id: randomUUID(),
      code: input.code,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    });
    return this.specialtyRepository.create(specialty);
  }
}
