import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '@/core/domain/entities/user.entity';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { Role } from '@/core/domain/enums/role.enum';
import type { IUserRepository } from '@/core/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '@/core/domain/interfaces/user-repository.interface';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import type { IHashingAdapter } from '@/core/domain/interfaces/hashing.interface';
import { HASHING_ADAPTER } from '@/core/domain/interfaces/hashing.interface';
import { EmailAlreadyInUseError } from '@/core/application/errors/application.error';

interface RegisterDoctorInput {
  email: string;
  password: string;
  name: string;
  crm: string;
  specialtyId: string;
}

interface RegisterDoctorOutput {
  user: UserEntity;
  doctor: DoctorEntity;
}

@Injectable()
export class RegisterDoctorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
    @Inject(HASHING_ADAPTER) private readonly hashing: IHashingAdapter,
  ) {}

  async execute(input: RegisterDoctorInput): Promise<RegisterDoctorOutput> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new EmailAlreadyInUseError(input.email);

    const passwordHash = await this.hashing.hash(input.password);

    const user = UserEntity.builder()
      .email(input.email)
      .passwordHash(passwordHash)
      .role(Role.DOCTOR)
      .build();

    const savedUser = await this.userRepository.create(user);

    const doctor = DoctorEntity.builder()
      .userId(savedUser.id)
      .name(input.name)
      .crm(input.crm)
      .specialtyId(input.specialtyId)
      .build();

    const savedDoctor = await this.doctorRepository.create(doctor);

    return { user: savedUser, doctor: savedDoctor };
  }
}
