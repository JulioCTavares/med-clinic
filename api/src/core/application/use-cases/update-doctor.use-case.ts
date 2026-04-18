import { Inject, Injectable } from '@nestjs/common';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

interface UpdateDoctorInput {
  id: string;
  name?: string;
  crm?: string;
  specialtyId?: string;
}

@Injectable()
export class UpdateDoctorUseCase {
  constructor(
    @Inject(DOCTOR_REPOSITORY) private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(input: UpdateDoctorInput): Promise<DoctorEntity> {
    const existing = await this.doctorRepository.findById(input.id);
    if (!existing) throw new ResourceNotFoundError('Doctor', input.id);

    const { id, ...data } = input;
    return this.doctorRepository.update(id, data);
  }
}
