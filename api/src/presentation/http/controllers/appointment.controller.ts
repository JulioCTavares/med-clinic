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
  Post,
  ConflictException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { CreateAppointmentDto } from '@/core/application/dtos/create-appointment.dto';
import { UpdateAppointmentDto } from '@/core/application/dtos/update-appointment.dto';
import { CreateAppointmentUseCase } from '@/core/application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from '@/core/application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from '@/core/application/use-cases/find-appointment-by-id.use-case';
import { UpdateAppointmentUseCase } from '@/core/application/use-cases/update-appointment.use-case';
import { DeleteAppointmentUseCase } from '@/core/application/use-cases/delete-appointment.use-case';
import { AppointmentConflictError, ResourceNotFoundError } from '@/core/application/errors/application.error';

@ApiBearerAuth()
@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly createUseCase: CreateAppointmentUseCase,
    private readonly findAllUseCase: FindAllAppointmentsUseCase,
    private readonly findByIdUseCase: FindAppointmentByIdUseCase,
    private readonly updateUseCase: UpdateAppointmentUseCase,
    private readonly deleteUseCase: DeleteAppointmentUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agendar consulta' })
  @ApiCreatedResponse({ description: 'Consulta agendada com sucesso.' })
  @ApiConflictResponse({ description: 'Choque de horário — médico ou paciente já tem consulta neste horário.' })
  async createOne(@Body() dto: CreateAppointmentDto) {
    return this.createUseCase.execute(dto).catch((err: unknown) => {
      if (err instanceof AppointmentConflictError) throw new ConflictException(err.message);
      throw err;
    });
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Listar consultas' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  listAll() {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Buscar consulta por ID' })
  @ApiOkResponse({ description: 'Consulta encontrada.' })
  @ApiNotFoundResponse({ description: 'Consulta não encontrada.' })
  async getOne(@Param('id') id: string) {
    return this.findByIdUseCase.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Atualizar status / dados da consulta' })
  @ApiOkResponse({ description: 'Consulta atualizada.' })
  @ApiNotFoundResponse({ description: 'Consulta não encontrada.' })
  @ApiConflictResponse({ description: 'Choque de horário no reagendamento.' })
  async updateOne(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.updateUseCase.execute({ id, ...dto }).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof AppointmentConflictError) throw new ConflictException(err.message);
      throw err;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar consulta — soft delete (admin)' })
  @ApiNoContentResponse({ description: 'Consulta removida.' })
  @ApiNotFoundResponse({ description: 'Consulta não encontrada.' })
  async deleteOne(@Param('id') id: string) {
    return this.deleteUseCase.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }
}
