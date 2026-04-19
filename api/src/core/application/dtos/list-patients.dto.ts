import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ListPatientsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('Página (começa em 1)'),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe('Itens por página (máx 100)'),
  name: z.string().optional().describe('Filtrar por nome (parcial, case-insensitive)'),
});

export class ListPatientsDto extends createZodDto(ListPatientsSchema) {}
