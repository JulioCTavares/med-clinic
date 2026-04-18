import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateHealthPlanSchema = z.object({
  code: z.string().min(2).max(50).optional(),
  description: z.string().min(2).max(200).optional(),
  phone: z.string().max(30).nullable().optional(),
});

export class UpdateHealthPlanDto extends createZodDto(UpdateHealthPlanSchema) {}
