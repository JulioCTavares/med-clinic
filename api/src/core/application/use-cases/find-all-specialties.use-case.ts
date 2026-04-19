import { Inject, Injectable } from '@nestjs/common';
import { SPECIALTY_REPOSITORY } from '@/core/domain/interfaces/specialty-repository.interface';
import type { ISpecialtyRepository, SpecialtyFilters } from '@/core/domain/interfaces/specialty-repository.interface';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';

@Injectable()
export class FindAllSpecialtiesUseCase {
  constructor(
    @Inject(SPECIALTY_REPOSITORY) private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  execute(params: SpecialtyFilters): Promise<PaginatedResult<SpecialtyEntity>> {
    return this.specialtyRepository.findPaginated(params);
  }
}
