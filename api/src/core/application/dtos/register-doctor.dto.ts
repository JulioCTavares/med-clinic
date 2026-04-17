import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterDoctorSchema = z.object({
  email: z.string().email().describe('E-mail institucional do médico'),
  password: z.string().min(8).describe('Senha com no mínimo 8 caracteres'),
  name: z.string().min(2).max(150).describe('Nome completo do médico'),
  crm: z.string().min(3).max(30).describe('Número do CRM com UF (ex: CRM/SP 123456)'),
  specialtyId: z.string().uuid().describe('UUID da especialidade médica'),
});

export class RegisterDoctorDto extends createZodDto(RegisterDoctorSchema) {}
