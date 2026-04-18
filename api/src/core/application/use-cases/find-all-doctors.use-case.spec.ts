import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllDoctorsUseCase } from './find-all-doctors.use-case';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';

const makeDoctor = () =>
  DoctorEntity.create({
    id: 'doctor-uuid',
    userId: 'user-uuid',
    name: 'Dr. João',
    crm: 'CRM-12345',
    specialtyId: 'spec-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindAllDoctorsUseCase', () => {
  let useCase: FindAllDoctorsUseCase;
  let doctorRepo: import('vitest').Mocked<IDoctorRepository>;

  beforeEach(() => {
    doctorRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllDoctorsUseCase(doctorRepo);
  });

  it('should return all doctors', async () => {
    const doctors = [makeDoctor(), makeDoctor()];
    doctorRepo.findAll.mockResolvedValue(doctors);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(DoctorEntity);
    expect(doctorRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should return empty array when no doctors exist', async () => {
    doctorRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
