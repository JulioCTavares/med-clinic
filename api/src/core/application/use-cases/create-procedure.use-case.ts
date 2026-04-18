import { Inject, Injectable } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '@/core/domain/interfaces/procedure-repository.interface';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import { randomUUID } from 'node:crypto';

interface CreateProcedureInput {
  code: string;
  name: string;
  value: string;
}

@Injectable()
export class CreateProcedureUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY) private readonly procedureRepository: IProcedureRepository,
  ) {}

  execute(input: CreateProcedureInput): Promise<ProcedureEntity> {
    const now = new Date();
    const procedure = ProcedureEntity.create({
      id: randomUUID(),
      code: input.code,
      name: input.name,
      value: input.value,
      createdAt: now,
      updatedAt: now,
    });
    return this.procedureRepository.create(procedure);
  }
}
