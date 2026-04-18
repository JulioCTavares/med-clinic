import { Inject, Injectable } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '@/core/domain/interfaces/procedure-repository.interface';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class DeleteProcedureUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY) private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.procedureRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError('Procedure', id);
    await this.procedureRepository.softDelete(id);
  }
}
