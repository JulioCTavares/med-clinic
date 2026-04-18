import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class DeletePatientUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.patientRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError('Patient', id);
    await this.patientRepository.softDelete(id);
  }
}
