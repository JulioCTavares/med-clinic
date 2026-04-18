import { Module } from '@nestjs/common';
import { SPECIALTY_REPOSITORY } from '@/core/domain/interfaces/specialty-repository.interface';
import { DrizzleSpecialtyRepository } from '@/infrastructure/database/repositories/specialty.repository';
import { FindAllSpecialtiesUseCase } from '@/core/application/use-cases/find-all-specialties.use-case';
import { FindSpecialtyByIdUseCase } from '@/core/application/use-cases/find-specialty-by-id.use-case';
import { CreateSpecialtyUseCase } from '@/core/application/use-cases/create-specialty.use-case';
import { UpdateSpecialtyUseCase } from '@/core/application/use-cases/update-specialty.use-case';
import { DeleteSpecialtyUseCase } from '@/core/application/use-cases/delete-specialty.use-case';
import { SpecialtyController } from '@/presentation/http/controllers/specialty.controller';

@Module({
  providers: [
    { provide: SPECIALTY_REPOSITORY, useClass: DrizzleSpecialtyRepository },
    FindAllSpecialtiesUseCase,
    FindSpecialtyByIdUseCase,
    CreateSpecialtyUseCase,
    UpdateSpecialtyUseCase,
    DeleteSpecialtyUseCase,
  ],
  controllers: [SpecialtyController],
})
export class SpecialtyModule {}
