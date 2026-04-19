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
  Query,
  ConflictException,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiConflictResponse,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { CreateAppointmentDto } from '@/core/application/dtos/create-appointment.dto';
import { UpdateAppointmentDto } from '@/core/application/dtos/update-appointment.dto';
import { ListAppointmentsDto } from '@/core/application/dtos/list-appointments.dto';
import { CreateAppointmentUseCase } from '@/core/application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from '@/core/application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from '@/core/application/use-cases/find-appointment-by-id.use-case';
import { FindMyAppointmentsUseCase } from '@/core/application/use-cases/find-my-appointments.use-case';
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
    private readonly findMyUseCase: FindMyAppointmentsUseCase,
    private readonly updateUseCase: UpdateAppointmentUseCase,
    private readonly deleteUseCase: DeleteAppointmentUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
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
  @ApiOperation({ summary: 'Listar consultas com paginação e filtros — paciente vê apenas as próprias' })
  @ApiOkResponse({ description: 'Lista paginada retornada com sucesso.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'doctorId', required: false, type: String })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  listAll(@Req() req: FastifyRequest, @Query() query: ListAppointmentsDto) {
    if (req.user!.role === Role.PATIENT) {
      return this.findMyUseCase.execute(req.user!.id, query).catch((err: unknown) => {
        if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
        throw err;
      });
    }
    return this.findAllUseCase.execute(query);
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
