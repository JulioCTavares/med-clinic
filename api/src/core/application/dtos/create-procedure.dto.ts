import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProcedureSchema = z.object({
  code: z.string().min(2).max(50).describe('Código único do procedimento'),
  name: z.string().min(2).max(150).describe('Nome do procedimento'),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/).describe('Valor (ex: "150.00")'),
});

export class CreateProcedureDto extends createZodDto(CreateProcedureSchema) {}
