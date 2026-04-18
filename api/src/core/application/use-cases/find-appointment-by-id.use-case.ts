import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class FindAppointmentByIdUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(id: string): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) throw new ResourceNotFoundError('Appointment', id);
    return appointment;
  }
}
