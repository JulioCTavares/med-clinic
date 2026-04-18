import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

interface UpdatePatientInput {
  id: string;
  name?: string;
  birthDate?: string;
  phones?: string[];
}

@Injectable()
export class UpdatePatientUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(input: UpdatePatientInput): Promise<PatientEntity> {
    const existing = await this.patientRepository.findById(input.id);
    if (!existing) throw new ResourceNotFoundError('Patient', input.id);

    const { id, ...data } = input;
    return this.patientRepository.update(id, data);
  }
}
