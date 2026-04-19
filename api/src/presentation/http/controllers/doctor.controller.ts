import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { UpdateDoctorDto } from '@/core/application/dtos/update-doctor.dto';
import { FindAllDoctorsUseCase } from '@/core/application/use-cases/find-all-doctors.use-case';
import { FindDoctorByIdUseCase } from '@/core/application/use-cases/find-doctor-by-id.use-case';
import { UpdateDoctorUseCase } from '@/core/application/use-cases/update-doctor.use-case';
import { DeleteDoctorUseCase } from '@/core/application/use-cases/delete-doctor.use-case';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@ApiBearerAuth()
@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly findAll: FindAllDoctorsUseCase,
    private readonly findById: FindDoctorByIdUseCase,
    private readonly update: UpdateDoctorUseCase,
    private readonly remove: DeleteDoctorUseCase,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Listar médicos' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  listAll() {
    return this.findAll.execute();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Buscar médico por ID' })
  @ApiOkResponse({ description: 'Médico encontrado.' })
  @ApiNotFoundResponse({ description: 'Médico não encontrado.' })
  async getOne(@Param('id') id: string) {
    return this.findById.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Atualizar médico (admin ou próprio médico)' })
  @ApiOkResponse({ description: 'Médico atualizado.' })
  @ApiNotFoundResponse({ description: 'Médico não encontrado.' })
  async updateOne(@Param('id') id: string, @Body() dto: UpdateDoctorDto, @Req() req: any) {
    const currentUser = req.user as { id: string; role: string };
    if (currentUser.role === Role.DOCTOR) {
      const doctor = await this.findById.execute(id).catch(() => null);
      if (!doctor || doctor.userId !== currentUser.id) {
        throw new ForbiddenException('Doctors can only update their own profile');
      }
    }
    return this.update.execute({ id, ...dto }).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover médico — soft delete (admin)' })
  @ApiNoContentResponse({ description: 'Médico removido.' })
  @ApiNotFoundResponse({ description: 'Médico não encontrado.' })
  async deleteOne(@Param('id') id: string) {
    return this.remove.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }
}
