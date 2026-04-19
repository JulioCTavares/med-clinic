import { Inject, Injectable } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '@/core/domain/interfaces/procedure-repository.interface';
import type { IProcedureRepository, ProcedureFilters } from '@/core/domain/interfaces/procedure-repository.interface';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';

@Injectable()
export class FindAllProceduresUseCase {
  constructor(
    @Inject(PROCEDURE_REPOSITORY) private readonly procedureRepository: IProcedureRepository,
  ) {}

  execute(params: ProcedureFilters): Promise<PaginatedResult<ProcedureEntity>> {
    return this.procedureRepository.findPaginated(params);
  }
}
