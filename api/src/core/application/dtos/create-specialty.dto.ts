import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSpecialtySchema = z.object({
  code: z.string().min(2).max(50).describe('Código único da especialidade'),
  name: z.string().min(2).max(100).describe('Nome da especialidade'),
});

export class CreateSpecialtyDto extends createZodDto(CreateSpecialtySchema) {}
