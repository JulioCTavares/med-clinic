import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterPatientUseCase } from './register-patient.use-case';
import { IUserRepository } from '@/core/domain/interfaces/user-repository.interface';
import { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { IHashingAdapter } from '@/core/domain/interfaces/hashing.interface';
import { UserEntity } from '@/core/domain/entities/user.entity';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { Role } from '@/core/domain/enums/role.enum';
import { EmailAlreadyInUseError } from '@/core/application/errors/application.error';

describe('RegisterPatientUseCase', () => {
  let useCase: RegisterPatientUseCase;
  let userRepository: import("vitest").Mocked<IUserRepository>;
  let patientRepository: import("vitest").Mocked<IPatientRepository>;
  let hashingAdapter: import("vitest").Mocked<IHashingAdapter>;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    } as any;

    patientRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
    } as any;

    hashingAdapter = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    useCase = new RegisterPatientUseCase(userRepository, patientRepository, hashingAdapter);
  });

  it('should register a new patient successfully', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashingAdapter.hash.mockResolvedValue('hashed_password');

    userRepository.create.mockImplementation(async (user) => {
      const entity = UserEntity.builder()
        .email(user.email)
        .passwordHash(user.passwordHash)
        .role(user.role)
        .build();
      (entity as any).id = 'user-uuid';
      return entity;
    });

    patientRepository.create.mockImplementation(async (patient) => {
      const entity = PatientEntity.builder()
        .userId(patient.userId)
        .name(patient.name)
        .birthDate(patient.birthDate!)
        .phones(patient.phones!)
        .build();
      (entity as any).id = 'patient-uuid';
      return entity;
    });

    const dto = {
      email: 'jane@example.com',
      password: 'password123',
      name: 'Jane Doe',
      birthDate: '1990-01-01',
      phones: ['123456789'],
    };

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(hashingAdapter.hash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.create).toHaveBeenCalled();
    expect(patientRepository.create).toHaveBeenCalled();

    expect(result.user).toBeInstanceOf(UserEntity);
    expect(result.user.email).toBe(dto.email);
    expect(result.user.role).toBe(Role.PATIENT);

    expect(result.patient).toBeInstanceOf(PatientEntity);
    expect(result.patient.name).toBe(dto.name);
    expect(result.patient.phones).toEqual(dto.phones);
  });

  it('should throw error if email already in use', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing' } as UserEntity);

    const dto = {
      email: 'jane@example.com',
      password: 'password123',
      name: 'Jane Doe',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(EmailAlreadyInUseError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(hashingAdapter.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(patientRepository.create).not.toHaveBeenCalled();
  });
});
