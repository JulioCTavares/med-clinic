import { Inject, Injectable } from '@nestjs/common';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';

@Injectable()
export class FindAllDoctorsUseCase {
  constructor(
    @Inject(DOCTOR_REPOSITORY) private readonly doctorRepository: IDoctorRepository,
  ) {}

  execute(): Promise<DoctorEntity[]> {
    return this.doctorRepository.findAll();
  }
}
