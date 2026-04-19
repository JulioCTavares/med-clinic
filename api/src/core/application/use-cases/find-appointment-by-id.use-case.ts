import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository, AppointmentView } from '@/core/domain/interfaces/appointment-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class FindAppointmentByIdUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(id: string): Promise<AppointmentView> {
    const appointment = await this.appointmentRepository.findByIdWithDoctor(id);
    if (!appointment) throw new ResourceNotFoundError('Appointment', id);
    return appointment;
  }
}
