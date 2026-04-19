import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { UpdatePatientDto } from '@/core/application/dtos/update-patient.dto';
import { FindAllPatientsUseCase } from '@/core/application/use-cases/find-all-patients.use-case';
import { FindPatientByIdUseCase } from '@/core/application/use-cases/find-patient-by-id.use-case';
import { FindPatientByUserIdUseCase } from '@/core/application/use-cases/find-patient-by-user-id.use-case';
import { UpdatePatientUseCase } from '@/core/application/use-cases/update-patient.use-case';
import { DeletePatientUseCase } from '@/core/application/use-cases/delete-patient.use-case';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@ApiBearerAuth()
@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(
    private readonly findAll: FindAllPatientsUseCase,
    private readonly findById: FindPatientByIdUseCase,
    private readonly findByUserId: FindPatientByUserIdUseCase,
    private readonly update: UpdatePatientUseCase,
    private readonly remove: DeletePatientUseCase,
  ) {}

  @Get('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Retornar perfil do paciente autenticado' })
  @ApiOkResponse({ description: 'Perfil retornado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Paciente não encontrado para este usuário.' })
  async getMe(@Req() req: FastifyRequest) {
    const { id: userId } = req.user!;
    return this.findByUserId.execute(userId).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Listar pacientes' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  listAll() {
    return this.findAll.execute();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiOkResponse({ description: 'Paciente encontrado.' })
  @ApiNotFoundResponse({ description: 'Paciente não encontrado.' })
  async getOne(@Param('id') id: string) {
    return this.findById.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PATIENT)
  @ApiOperation({ summary: 'Atualizar paciente (admin ou próprio paciente)' })
  @ApiOkResponse({ description: 'Paciente atualizado.' })
  @ApiNotFoundResponse({ description: 'Paciente não encontrado.' })
  async updateOne(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.update.execute({ id, ...dto }).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover paciente — soft delete (admin)' })
  @ApiNoContentResponse({ description: 'Paciente removido.' })
  @ApiNotFoundResponse({ description: 'Paciente não encontrado.' })
  async deleteOne(@Param('id') id: string) {
    return this.remove.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }
}
