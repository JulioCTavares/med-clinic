import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '@/core/domain/interfaces/user-repository.interface';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import { HASHING_ADAPTER } from '@/core/domain/interfaces/hashing.interface';
import { CACHE_SERVICE, ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { DrizzleUserRepository } from '@/infrastructure/database/repositories/user.repository';
import { DrizzleDoctorRepository } from '@/infrastructure/database/repositories/doctor.repository';
import { DrizzlePatientRepository } from '@/infrastructure/database/repositories/patient.repository';
import { CachedDoctorRepository } from '@/infrastructure/cache/proxies/cached-doctor.repository';
import { Argon2HashingAdapter } from '@/infrastructure/security/hashing/argon2-hashing.adapter';
import { SecurityModule } from '@/infrastructure/security/security.module';
import { RedisModule } from '@/infrastructure/cache/redis/redis.module';
import { RegisterDoctorUseCase } from '@/core/application/use-cases/register-doctor.use-case';
import { RegisterPatientUseCase } from '@/core/application/use-cases/register-patient.use-case';
import { LoginUseCase } from '@/core/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@/core/application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@/core/application/use-cases/logout.use-case';
import { AuthController } from '@/presentation/http/controllers/auth.controller';

@Module({
  imports: [SecurityModule, RedisModule],
  providers: [
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
    DrizzleDoctorRepository,
    {
      provide: DOCTOR_REPOSITORY,
      useFactory: (repo: DrizzleDoctorRepository, cache: ICacheService) =>
        new CachedDoctorRepository(repo, cache),
      inject: [DrizzleDoctorRepository, CACHE_SERVICE],
    },
    { provide: PATIENT_REPOSITORY, useClass: DrizzlePatientRepository },
    { provide: HASHING_ADAPTER, useClass: Argon2HashingAdapter },
    RegisterDoctorUseCase,
    RegisterPatientUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
  controllers: [AuthController],
})
export class AuthModule { }
