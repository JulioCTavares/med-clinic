import { Module } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import { DrizzlePatientRepository } from '@/infrastructure/database/repositories/patient.repository';
import { UserController } from '@/presentation/http/controllers/user.controller';

@Module({
  providers: [
    { provide: PATIENT_REPOSITORY, useClass: DrizzlePatientRepository },
  ],
  controllers: [UserController],
})
export class UserModule {}
