import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';

export const UpdateAppointmentSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  isPrivate: z.boolean().optional(),
});

export class UpdateAppointmentDto extends createZodDto(UpdateAppointmentSchema) {}
