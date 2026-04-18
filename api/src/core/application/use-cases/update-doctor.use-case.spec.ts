import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateDoctorUseCase } from './update-doctor.use-case';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeDoctor = (overrides: Partial<Parameters<typeof DoctorEntity.create>[0]> = {}) =>
  DoctorEntity.create({
    id: 'doctor-uuid',
    userId: 'user-uuid',
    name: 'Dr. João',
    crm: 'CRM-12345',
    specialtyId: 'spec-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('UpdateDoctorUseCase', () => {
  let useCase: UpdateDoctorUseCase;
  let doctorRepo: import('vitest').Mocked<IDoctorRepository>;

  beforeEach(() => {
    doctorRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new UpdateDoctorUseCase(doctorRepo);
  });

  it('should throw ResourceNotFoundError when doctor does not exist', async () => {
    doctorRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id', name: 'Dr. Carlos' })).rejects.toThrow(ResourceNotFoundError);
    expect(doctorRepo.update).not.toHaveBeenCalled();
  });

  it('should update and return the updated doctor', async () => {
    const existing = makeDoctor();
    const updated = makeDoctor({ name: 'Dr. Carlos' });
    doctorRepo.findById.mockResolvedValue(existing);
    doctorRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'doctor-uuid', name: 'Dr. Carlos' });

    expect(result.name).toBe('Dr. Carlos');
    expect(doctorRepo.update).toHaveBeenCalledWith('doctor-uuid', { name: 'Dr. Carlos' });
  });

  it('should pass only provided fields to repository', async () => {
    doctorRepo.findById.mockResolvedValue(makeDoctor());
    doctorRepo.update.mockResolvedValue(makeDoctor({ crm: 'CRM-99999' }));

    await useCase.execute({ id: 'doctor-uuid', crm: 'CRM-99999' });

    expect(doctorRepo.update).toHaveBeenCalledWith('doctor-uuid', { crm: 'CRM-99999' });
  });

  it('should allow updating specialtyId', async () => {
    doctorRepo.findById.mockResolvedValue(makeDoctor());
    doctorRepo.update.mockResolvedValue(makeDoctor({ specialtyId: 'new-spec-uuid' }));

    const result = await useCase.execute({ id: 'doctor-uuid', specialtyId: 'new-spec-uuid' });

    expect(result.specialtyId).toBe('new-spec-uuid');
    expect(doctorRepo.update).toHaveBeenCalledWith('doctor-uuid', { specialtyId: 'new-spec-uuid' });
  });
});
