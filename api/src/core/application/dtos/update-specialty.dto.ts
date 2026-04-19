import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateSpecialtySchema = z.object({
  code: z.string().min(2).max(50).optional(),
  name: z.string().min(2).max(100).optional(),
});

export class UpdateSpecialtyDto extends createZodDto(UpdateSpecialtySchema) {}
