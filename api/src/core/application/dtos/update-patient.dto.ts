import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdatePatientSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  phones: z.array(z.string()).optional(),
});

export class UpdatePatientDto extends createZodDto(UpdatePatientSchema) {}
