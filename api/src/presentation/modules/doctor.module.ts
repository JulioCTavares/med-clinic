import { Module } from '@nestjs/common';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import { CACHE_SERVICE, ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { DrizzleDoctorRepository } from '@/infrastructure/database/repositories/doctor.repository';
import { CachedDoctorRepository } from '@/infrastructure/cache/proxies/cached-doctor.repository';
import { FindAllDoctorsUseCase } from '@/core/application/use-cases/find-all-doctors.use-case';
import { FindDoctorByIdUseCase } from '@/core/application/use-cases/find-doctor-by-id.use-case';
import { UpdateDoctorUseCase } from '@/core/application/use-cases/update-doctor.use-case';
import { DeleteDoctorUseCase } from '@/core/application/use-cases/delete-doctor.use-case';
import { DoctorController } from '@/presentation/http/controllers/doctor.controller';

@Module({
  providers: [
    DrizzleDoctorRepository,
    {
      provide: DOCTOR_REPOSITORY,
      useFactory: (repo: DrizzleDoctorRepository, cache: ICacheService) =>
        new CachedDoctorRepository(repo, cache),
      inject: [DrizzleDoctorRepository, CACHE_SERVICE],
    },
    FindAllDoctorsUseCase,
    FindDoctorByIdUseCase,
    UpdateDoctorUseCase,
    DeleteDoctorUseCase,
  ],
  controllers: [DoctorController],
})
export class DoctorModule {}
