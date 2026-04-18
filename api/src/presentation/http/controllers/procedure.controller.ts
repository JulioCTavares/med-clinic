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
import { CreateProcedureDto } from '@/core/application/dtos/create-procedure.dto';
import { UpdateProcedureDto } from '@/core/application/dtos/update-procedure.dto';
import { FindAllProceduresUseCase } from '@/core/application/use-cases/find-all-procedures.use-case';
import { FindProcedureByIdUseCase } from '@/core/application/use-cases/find-procedure-by-id.use-case';
import { CreateProcedureUseCase } from '@/core/application/use-cases/create-procedure.use-case';
import { UpdateProcedureUseCase } from '@/core/application/use-cases/update-procedure.use-case';
import { DeleteProcedureUseCase } from '@/core/application/use-cases/delete-procedure.use-case';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@ApiBearerAuth()
@ApiTags('Procedures')
@Controller('procedures')
export class ProcedureController {
  constructor(
    private readonly findAll: FindAllProceduresUseCase,
    private readonly findById: FindProcedureByIdUseCase,
    private readonly create: CreateProcedureUseCase,
    private readonly update: UpdateProcedureUseCase,
    private readonly remove: DeleteProcedureUseCase,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Listar procedimentos' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  listAll() {
    return this.findAll.execute();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Buscar procedimento por ID' })
  @ApiOkResponse({ description: 'Procedimento encontrado.' })
  @ApiNotFoundResponse({ description: 'Procedimento não encontrado.' })
  async getOne(@Param('id') id: string) {
    return this.findById.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar procedimento (admin)' })
  @ApiCreatedResponse({ description: 'Procedimento criado.' })
  createOne(@Body() dto: CreateProcedureDto) {
    return this.create.execute(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar procedimento (admin)' })
  @ApiOkResponse({ description: 'Procedimento atualizado.' })
  @ApiNotFoundResponse({ description: 'Procedimento não encontrado.' })
  async updateOne(@Param('id') id: string, @Body() dto: UpdateProcedureDto) {
    return this.update.execute({ id, ...dto }).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover procedimento — soft delete (admin)' })
  @ApiNoContentResponse({ description: 'Procedimento removido.' })
  @ApiNotFoundResponse({ description: 'Procedimento não encontrado.' })
  async deleteOne(@Param('id') id: string) {
    return this.remove.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }
}
