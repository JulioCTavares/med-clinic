import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { JwtAuthGuard } from '@/infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '@/infrastructure/security/guards/roles.guard';
import { AuthModule } from '@/presentation/modules/auth.module';
import { SpecialtyModule } from '@/presentation/modules/specialty.module';
import { HealthPlanModule } from '@/presentation/modules/health-plan.module';
import { ProcedureModule } from '@/presentation/modules/procedure.module';
import { DoctorModule } from '@/presentation/modules/doctor.module';
import { PatientModule } from '@/presentation/modules/patient.module';
import { AppointmentModule } from '@/presentation/modules/appointment.module';
import { PatientHealthPlanModule } from '@/presentation/modules/patient-health-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    SpecialtyModule,
    HealthPlanModule,
    ProcedureModule,
    DoctorModule,
    PatientModule,
    AppointmentModule,
    PatientHealthPlanModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
