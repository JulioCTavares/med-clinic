import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository, AppointmentView } from '@/core/domain/interfaces/appointment-repository.interface';

@Injectable()
export class FindAllAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  execute(): Promise<AppointmentView[]> {
    return this.appointmentRepository.findAllWithDoctor();
  }
}
