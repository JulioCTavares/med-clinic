import { Module } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '@/core/domain/interfaces/procedure-repository.interface';
import { DrizzleProcedureRepository } from '@/infrastructure/database/repositories/procedure.repository';
import { FindAllProceduresUseCase } from '@/core/application/use-cases/find-all-procedures.use-case';
import { FindProcedureByIdUseCase } from '@/core/application/use-cases/find-procedure-by-id.use-case';
import { CreateProcedureUseCase } from '@/core/application/use-cases/create-procedure.use-case';
import { UpdateProcedureUseCase } from '@/core/application/use-cases/update-procedure.use-case';
import { DeleteProcedureUseCase } from '@/core/application/use-cases/delete-procedure.use-case';
import { ProcedureController } from '@/presentation/http/controllers/procedure.controller';

@Module({
  providers: [
    { provide: PROCEDURE_REPOSITORY, useClass: DrizzleProcedureRepository },
    FindAllProceduresUseCase,
    FindProcedureByIdUseCase,
    CreateProcedureUseCase,
    UpdateProcedureUseCase,
    DeleteProcedureUseCase,
  ],
  controllers: [ProcedureController],
})
export class ProcedureModule {}
