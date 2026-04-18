import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';

@Injectable()
export class FindAllAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  execute(): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.findAll();
  }
}
