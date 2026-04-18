import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { AppointmentConflictError, ResourceNotFoundError } from '@/core/application/errors/application.error';

interface UpdateAppointmentInput {
  id: string;
  status?: AppointmentStatus;
  date?: string;
  time?: string;
  isPrivate?: boolean;
}

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(input: UpdateAppointmentInput): Promise<AppointmentEntity> {
    const existing = await this.appointmentRepository.findById(input.id);
    if (!existing) throw new ResourceNotFoundError('Appointment', input.id);

    if (input.date || input.time) {
      const conflict = await this.appointmentRepository.findConflict(
        existing.doctorId,
        existing.patientId,
        input.date ?? existing.date,
        input.time ?? existing.time,
        input.id,
      );
      if (conflict) throw new AppointmentConflictError();
    }

    const { id, ...data } = input;
    return this.appointmentRepository.update(id, data);
  }
}
