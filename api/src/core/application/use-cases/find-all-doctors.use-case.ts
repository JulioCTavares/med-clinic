import { Inject, Injectable } from '@nestjs/common';
import { DOCTOR_REPOSITORY } from '@/core/domain/interfaces/doctor-repository.interface';
import type { IDoctorRepository, DoctorFilters } from '@/core/domain/interfaces/doctor-repository.interface';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';

@Injectable()
export class FindAllDoctorsUseCase {
  constructor(
    @Inject(DOCTOR_REPOSITORY) private readonly doctorRepository: IDoctorRepository,
  ) {}

  execute(params: DoctorFilters): Promise<PaginatedResult<DoctorEntity>> {
    return this.doctorRepository.findPaginated(params);
  }
}
