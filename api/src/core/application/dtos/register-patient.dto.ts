import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterPatientSchema = z.object({
  email: z.string().email().describe('E-mail do paciente'),
  password: z.string().min(8).describe('Senha com no mínimo 8 caracteres'),
  name: z.string().min(2).max(150).describe('Nome completo do paciente'),
  birthDate: z
    .string()
    .date()
    .optional()
    .describe('Data de nascimento no formato YYYY-MM-DD'),
  phones: z
    .array(z.string().max(30))
    .optional()
    .describe('Lista de telefones de contato'),
});

export class RegisterPatientDto extends createZodDto(RegisterPatientSchema) {}
