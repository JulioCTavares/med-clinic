import { Inject, Injectable } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '@/core/domain/interfaces/procedure-repository.interface';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

interface UpdateProcedureInput {
  id: string;
  code?: string;
  name?: string;
  value?: string;
}

@Injectable()
export class UpdateProcedureUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY) private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(input: UpdateProcedureInput): Promise<ProcedureEntity> {
    const existing = await this.procedureRepository.findById(input.id);
    if (!existing) throw new ResourceNotFoundError('Procedure', input.id);

    const { id, ...data } = input;
    return this.procedureRepository.update(id, data);
  }
}
