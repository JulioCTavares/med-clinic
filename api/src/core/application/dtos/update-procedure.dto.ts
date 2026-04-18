import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProcedureSchema = z.object({
  code: z.string().min(2).max(50).optional(),
  name: z.string().min(2).max(150).optional(),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

export class UpdateProcedureDto extends createZodDto(UpdateProcedureSchema) {}
