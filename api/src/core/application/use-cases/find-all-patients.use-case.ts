import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IPatientRepository, PatientFilters } from '@/core/domain/interfaces/patient-repository.interface';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { PatientEntity } from '@/core/domain/entities/patient.entity';

@Injectable()
export class FindAllPatientsUseCase {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
  ) {}

  execute(params: PatientFilters): Promise<PaginatedResult<PatientEntity>> {
    return this.patientRepository.findPaginated(params);
  }
}
