import { Inject, Injectable } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '@/core/domain/interfaces/procedure-repository.interface';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';

@Injectable()
export class FindAllProceduresUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY) private readonly procedureRepository: IProcedureRepository,
  ) {}

  execute(): Promise<ProcedureEntity[]> {
    return this.procedureRepository.findAll();
  }
}
