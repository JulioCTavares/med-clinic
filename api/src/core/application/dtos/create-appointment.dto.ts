import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  code: z.string().min(1).max(50).describe('Código único da consulta'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Data (YYYY-MM-DD)'),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).describe('Hora (HH:MM)'),
  isPrivate: z.boolean().default(false).describe('Consulta particular'),
  patientId: z.string().uuid().describe('UUID do paciente'),
  doctorId: z.string().uuid().describe('UUID do médico'),
  procedureIds: z.array(z.string().uuid()).optional().describe('UUIDs dos procedimentos'),
});

export class CreateAppointmentDto extends createZodDto(CreateAppointmentSchema) {}
