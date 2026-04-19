import { Module } from '@nestjs/common';
import { PROCEDURE_REPOSITORY } from '@/core/domain/interfaces/procedure-repository.interface';
import { CACHE_SERVICE, ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { DrizzleProcedureRepository } from '@/infrastructure/database/repositories/procedure.repository';
import { CachedProcedureRepository } from '@/infrastructure/cache/proxies/cached-procedure.repository';
import { FindAllProceduresUseCase } from '@/core/application/use-cases/find-all-procedures.use-case';
import { FindProcedureByIdUseCase } from '@/core/application/use-cases/find-procedure-by-id.use-case';
import { CreateProcedureUseCase } from '@/core/application/use-cases/create-procedure.use-case';
import { UpdateProcedureUseCase } from '@/core/application/use-cases/update-procedure.use-case';
import { DeleteProcedureUseCase } from '@/core/application/use-cases/delete-procedure.use-case';
import { ProcedureController } from '@/presentation/http/controllers/procedure.controller';

@Module({
  providers: [
    DrizzleProcedureRepository,
    {
      provide: PROCEDURE_REPOSITORY,
      useFactory: (repo: DrizzleProcedureRepository, cache: ICacheService) =>
        new CachedProcedureRepository(repo, cache),
      inject: [DrizzleProcedureRepository, CACHE_SERVICE],
    },
    FindAllProceduresUseCase,
    FindProcedureByIdUseCase,
    CreateProcedureUseCase,
    UpdateProcedureUseCase,
    DeleteProcedureUseCase,
  ],
  controllers: [ProcedureController],
})
export class ProcedureModule {}
