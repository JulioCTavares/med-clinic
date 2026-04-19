import { Controller, Get, Inject, NotFoundException, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { PATIENT_REPOSITORY } from '@/core/domain/interfaces/patient-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
  ) {}

  @Get('me')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Retornar perfil do usuário autenticado (com dados de paciente, se aplicável)' })
  @ApiOkResponse({ description: 'Perfil retornado com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiNotFoundResponse({ description: 'Paciente não encontrado para o usuário autenticado.' })
  async getMe(@Req() req: FastifyRequest) {
    const { id, email, role } = req.user!;

    if (role !== Role.PATIENT) {
      return { id, email, role };
    }

    const patient = await this.patientRepository.findByUserId(id);
    if (!patient) throw new NotFoundException('Paciente não encontrado para este usuário.');

    return {
      id,
      email,
      role,
      patient: {
        id: patient.id,
        userId: patient.userId,
        name: patient.name,
        birthDate: patient.birthDate,
        phones: patient.phones,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    };
  }
}
