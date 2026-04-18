import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssociatePatientHealthPlanSchema = z.object({
  healthPlanId: z.string().uuid().describe('ID do plano de saúde'),
  contractNumber: z.string().min(1).max(100).describe('Número do contrato'),
});

export class AssociatePatientHealthPlanDto extends createZodDto(AssociatePatientHealthPlanSchema) {}
