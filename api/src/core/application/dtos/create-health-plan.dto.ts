import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateHealthPlanSchema = z.object({
  code: z.string().min(2).max(50).describe('Código único do plano'),
  description: z.string().min(2).max(200).describe('Descrição do plano de saúde'),
  phone: z.string().max(30).optional().describe('Telefone de contato'),
});

export class CreateHealthPlanDto extends createZodDto(CreateHealthPlanSchema) {}
