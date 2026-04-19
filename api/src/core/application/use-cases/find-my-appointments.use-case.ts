import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import type { IAppointmentRepository, AppointmentView } from '@/core/domain/interfaces/appointment-repository.interface';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class FindMyAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY) private readonly appointmentRepository: IAppointmentRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(userId: string): Promise<AppointmentView[]> {
    const patient = await this.patientRepository.findByUserId(userId);
    if (!patient) throw new ResourceNotFoundError('Patient', userId);
    return this.appointmentRepository.findByPatientId(patient.id);
  }
}
