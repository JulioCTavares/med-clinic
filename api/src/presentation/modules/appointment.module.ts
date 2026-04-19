import { Module } from '@nestjs/common';
import { APPOINTMENT_REPOSITORY } from '@/core/domain/interfaces/appointment-repository.interface';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import { DrizzleAppointmentRepository } from '@/infrastructure/database/repositories/appointment.repository';
import { DrizzlePatientRepository } from '@/infrastructure/database/repositories/patient.repository';
import { CreateAppointmentUseCase } from '@/core/application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from '@/core/application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from '@/core/application/use-cases/find-appointment-by-id.use-case';
import { FindMyAppointmentsUseCase } from '@/core/application/use-cases/find-my-appointments.use-case';
import { UpdateAppointmentUseCase } from '@/core/application/use-cases/update-appointment.use-case';
import { DeleteAppointmentUseCase } from '@/core/application/use-cases/delete-appointment.use-case';
import { AppointmentController } from '@/presentation/http/controllers/appointment.controller';

@Module({
  providers: [
    { provide: APPOINTMENT_REPOSITORY, useClass: DrizzleAppointmentRepository },
    { provide: PATIENT_REPOSITORY, useClass: DrizzlePatientRepository },
    CreateAppointmentUseCase,
    FindAllAppointmentsUseCase,
    FindAppointmentByIdUseCase,
    FindMyAppointmentsUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentUseCase,
  ],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
