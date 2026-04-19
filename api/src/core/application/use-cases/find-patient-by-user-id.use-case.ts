import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class FindPatientByUserIdUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(userId: string): Promise<PatientEntity> {
    const patient = await this.patientRepository.findByUserId(userId);
    if (!patient) throw new ResourceNotFoundError('Patient', userId);
    return patient;
  }
}
