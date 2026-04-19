import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository, AppointmentView, AppointmentFilters } from '@/core/domain/interfaces/appointment-repository.interface';
import type { PaginatedResult } from '@/common/types/paginated-result';

@Injectable()
export class FindAllAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  execute(params: AppointmentFilters): Promise<PaginatedResult<AppointmentView>> {
    return this.appointmentRepository.findPaginatedWithDoctor(params);
  }
}
