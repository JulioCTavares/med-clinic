import { Module } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import { DrizzlePatientRepository } from '@/infrastructure/database/repositories/patient.repository';
import { FindAllPatientsUseCase } from '@/core/application/use-cases/find-all-patients.use-case';
import { FindPatientByIdUseCase } from '@/core/application/use-cases/find-patient-by-id.use-case';
import { UpdatePatientUseCase } from '@/core/application/use-cases/update-patient.use-case';
import { DeletePatientUseCase } from '@/core/application/use-cases/delete-patient.use-case';
import { PatientController } from '@/presentation/http/controllers/patient.controller';

@Module({
  providers: [
    { provide: PATIENT_REPOSITORY, useClass: DrizzlePatientRepository },
    FindAllPatientsUseCase,
    FindPatientByIdUseCase,
    UpdatePatientUseCase,
    DeletePatientUseCase,
  ],
  controllers: [PatientController],
})
export class PatientModule {}
