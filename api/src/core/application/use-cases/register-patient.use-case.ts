import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '@/core/domain/entities/user.entity';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { Role } from '@/core/domain/enums/role.enum';
import type { IUserRepository } from '@/core/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '@/core/domain/interfaces/user-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IHashingAdapter } from '@/core/domain/interfaces/hashing.interface';
import { HASHING_ADAPTER } from '@/core/domain/interfaces/hashing.interface';
import { EmailAlreadyInUseError } from '@/core/application/errors/application.error';

interface RegisterPatientInput {
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  phones?: string[];
}

interface RegisterPatientOutput {
  user: UserEntity;
  patient: PatientEntity;
}

@Injectable()
export class RegisterPatientUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepository: IPatientRepository,
    @Inject(HASHING_ADAPTER) private readonly hashing: IHashingAdapter,
  ) {}

  async execute(input: RegisterPatientInput): Promise<RegisterPatientOutput> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new EmailAlreadyInUseError(input.email);

    const passwordHash = await this.hashing.hash(input.password);

    const user = UserEntity.builder()
      .email(input.email)
      .passwordHash(passwordHash)
      .role(Role.PATIENT)
      .build();

    const savedUser = await this.userRepository.create(user);

    const builder = PatientEntity.builder()
      .userId(savedUser.id)
      .name(input.name);

    if (input.birthDate) builder.birthDate(input.birthDate);
    if (input.phones) builder.phones(input.phones);

    const savedPatient = await this.patientRepository.create(builder.build());

    return { user: savedUser, patient: savedPatient };
  }
}
