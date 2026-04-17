import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '@/core/domain/interfaces/user-repository.interface';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import { HASHING_ADAPTER } from '@/core/domain/interfaces/hashing.interface';
import { DrizzleUserRepository } from '@/infrastructure/database/repositories/user.repository';
import { DrizzleDoctorRepository } from '@/infrastructure/database/repositories/doctor.repository';
import { DrizzlePatientRepository } from '@/infrastructure/database/repositories/patient.repository';
import { Argon2HashingAdapter } from '@/infrastructure/security/hashing/argon2-hashing.adapter';
import { RegisterDoctorUseCase } from '@/core/application/use-cases/register-doctor.use-case';
import { RegisterPatientUseCase } from '@/core/application/use-cases/register-patient.use-case';
import { AuthController } from '@/presentation/http/controllers/auth.controller';

@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    { provide: DOCTOR_REPOSITORY, useClass: DrizzleDoctorRepository },
    { provide: PATIENT_REPOSITORY, useClass: DrizzlePatientRepository },
    { provide: HASHING_ADAPTER, useClass: Argon2HashingAdapter },
    RegisterDoctorUseCase,
    RegisterPatientUseCase,
  ],
  controllers: [AuthController],
})
export class AuthModule { }
