import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterDoctorUseCase } from './register-doctor.use-case';
import { IUserRepository } from '@/core/domain/interfaces/user-repository.interface';
import { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { IHashingAdapter } from '@/core/domain/interfaces/hashing.interface';
import { UserEntity } from '@/core/domain/entities/user.entity';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { Role } from '@/core/domain/enums/role.enum';
import { EmailAlreadyInUseError } from '@/core/application/errors/application.error';

describe('RegisterDoctorUseCase', () => {
  let useCase: RegisterDoctorUseCase;
  let userRepository: import("vitest").Mocked<IUserRepository>;
  let doctorRepository: import("vitest").Mocked<IDoctorRepository>;
  let hashingAdapter: import("vitest").Mocked<IHashingAdapter>;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    } as any;

    doctorRepository = {
      create: vi.fn(),
      findByUserId: vi.fn(),
    } as any;

    hashingAdapter = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    useCase = new RegisterDoctorUseCase(userRepository, doctorRepository, hashingAdapter);
  });

  it('should register a new doctor successfully', async () => {
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

    doctorRepository.create.mockImplementation(async (doc) => {
      const entity = DoctorEntity.builder()
        .userId(doc.userId)
        .name(doc.name)
        .crm(doc.crm)
        .specialtyId(doc.specialtyId)
        .build();
      (entity as any).id = 'doc-uuid';
      return entity;
    });

    const dto = {
      email: 'john@example.com',
      password: 'password123',
      name: 'Dr. John Doe',
      crm: '12345',
      specialtyId: 'spec-uuid',
    };

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(hashingAdapter.hash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.create).toHaveBeenCalled();
    expect(doctorRepository.create).toHaveBeenCalled();

    expect(result.user).toBeInstanceOf(UserEntity);
    expect(result.user.email).toBe(dto.email);
    expect(result.user.role).toBe(Role.DOCTOR);

    expect(result.doctor).toBeInstanceOf(DoctorEntity);
    expect(result.doctor.name).toBe(dto.name);
    expect(result.doctor.crm).toBe(dto.crm);
  });

  it('should throw error if email already in use', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing' } as UserEntity);

    const dto = {
      email: 'john@example.com',
      password: 'password123',
      name: 'Dr. John Doe',
      crm: '12345',
      specialtyId: 'spec-uuid',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(EmailAlreadyInUseError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(hashingAdapter.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(doctorRepository.create).not.toHaveBeenCalled();
  });
});
