import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';

export const ListAppointmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('Página (começa em 1)'),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe('Itens por página (máx 100)'),
  status: z.nativeEnum(AppointmentStatus).optional().describe('Filtrar por status'),
  doctorId: z.string().uuid().optional().describe('Filtrar por UUID do médico'),
  patientId: z.string().uuid().optional().describe('Filtrar por UUID do paciente'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Filtrar por data (YYYY-MM-DD)'),
});

export class ListAppointmentsDto extends createZodDto(ListAppointmentsSchema) {}
