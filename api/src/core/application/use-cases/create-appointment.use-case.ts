import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { AppointmentConflictError } from '@/core/application/errors/application.error';
import { randomUUID } from 'node:crypto';

interface CreateAppointmentInput {
  code: string;
  date: string;
  time: string;
  isPrivate: boolean;
  patientId: string;
  doctorId: string;
}

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(input: CreateAppointmentInput): Promise<AppointmentEntity> {
    const conflict = await this.appointmentRepository.findConflict(
      input.doctorId,
      input.patientId,
      input.date,
      input.time,
    );
    if (conflict) throw new AppointmentConflictError();

    const now = new Date();
    const appointment = AppointmentEntity.create({
      id: randomUUID(),
      code: input.code,
      date: input.date,
      time: input.time,
      isPrivate: input.isPrivate,
      status: AppointmentStatus.PENDING,
      patientId: input.patientId,
      doctorId: input.doctorId,
      createdAt: now,
      updatedAt: now,
    });

    return this.appointmentRepository.create(appointment);
  }
}
