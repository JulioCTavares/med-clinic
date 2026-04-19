import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateDoctorSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  crm: z.string().min(3).max(30).optional(),
  specialtyId: z.string().uuid().optional(),
});

export class UpdateDoctorDto extends createZodDto(UpdateDoctorSchema) {}
