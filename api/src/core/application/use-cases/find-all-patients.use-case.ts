import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';

@Injectable()
export class FindAllPatientsUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
  ) {}

  execute(): Promise<PatientEntity[]> {
    return this.patientRepository.findAll();
  }
}
