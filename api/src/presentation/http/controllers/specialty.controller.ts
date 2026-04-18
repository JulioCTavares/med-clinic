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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { CreateSpecialtyDto } from '@/core/application/dtos/create-specialty.dto';
import { UpdateSpecialtyDto } from '@/core/application/dtos/update-specialty.dto';
import { FindAllSpecialtiesUseCase } from '@/core/application/use-cases/find-all-specialties.use-case';
import { FindSpecialtyByIdUseCase } from '@/core/application/use-cases/find-specialty-by-id.use-case';
import { CreateSpecialtyUseCase } from '@/core/application/use-cases/create-specialty.use-case';
import { UpdateSpecialtyUseCase } from '@/core/application/use-cases/update-specialty.use-case';
import { DeleteSpecialtyUseCase } from '@/core/application/use-cases/delete-specialty.use-case';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@ApiBearerAuth()
@ApiTags('Especialidades')
@Controller('especialidades')
export class SpecialtyController {
  constructor(
    private readonly findAll: FindAllSpecialtiesUseCase,
    private readonly findById: FindSpecialtyByIdUseCase,
    private readonly create: CreateSpecialtyUseCase,
    private readonly update: UpdateSpecialtyUseCase,
    private readonly remove: DeleteSpecialtyUseCase,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Listar especialidades' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  listAll() {
    return this.findAll.execute();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Buscar especialidade por ID' })
  @ApiOkResponse({ description: 'Especialidade encontrada.' })
  @ApiNotFoundResponse({ description: 'Especialidade não encontrada.' })
  async getOne(@Param('id') id: string) {
    return this.findById.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar especialidade (admin)' })
  @ApiCreatedResponse({ description: 'Especialidade criada.' })
  createOne(@Body() dto: CreateSpecialtyDto) {
    return this.create.execute(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar especialidade (admin)' })
  @ApiOkResponse({ description: 'Especialidade atualizada.' })
  @ApiNotFoundResponse({ description: 'Especialidade não encontrada.' })
  async updateOne(@Param('id') id: string, @Body() dto: UpdateSpecialtyDto) {
    return this.update.execute({ id, ...dto }).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover especialidade — soft delete (admin)' })
  @ApiNoContentResponse({ description: 'Especialidade removida.' })
  @ApiNotFoundResponse({ description: 'Especialidade não encontrada.' })
  async deleteOne(@Param('id') id: string) {
    return this.remove.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }
}
