import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class DeleteAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError('Appointment', id);
    await this.appointmentRepository.softDelete(id);
  }
}
