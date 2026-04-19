import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ListHealthPlansSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('Página (começa em 1)'),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe('Itens por página (máx 100)'),
  code: z.string().optional().describe('Filtrar por código (parcial, case-insensitive)'),
  description: z.string().optional().describe('Filtrar por descrição (parcial, case-insensitive)'),
});

export class ListHealthPlansDto extends createZodDto(ListHealthPlansSchema) {}
