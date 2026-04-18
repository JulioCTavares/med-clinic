import { Inject, Injectable } from '@nestjs/common';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class FindDoctorByIdUseCase {
  constructor(
    @Inject(DOCTOR_REPOSITORY) private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(id: string): Promise<DoctorEntity> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) throw new ResourceNotFoundError('Doctor', id);
    return doctor;
  }
}
