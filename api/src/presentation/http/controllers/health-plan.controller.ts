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
import { CreateHealthPlanDto } from '@/core/application/dtos/create-health-plan.dto';
import { UpdateHealthPlanDto } from '@/core/application/dtos/update-health-plan.dto';
import { FindAllHealthPlansUseCase } from '@/core/application/use-cases/find-all-health-plans.use-case';
import { FindHealthPlanByIdUseCase } from '@/core/application/use-cases/find-health-plan-by-id.use-case';
import { CreateHealthPlanUseCase } from '@/core/application/use-cases/create-health-plan.use-case';
import { UpdateHealthPlanUseCase } from '@/core/application/use-cases/update-health-plan.use-case';
import { DeleteHealthPlanUseCase } from '@/core/application/use-cases/delete-health-plan.use-case';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@ApiBearerAuth()
@ApiTags('Planos de Saúde')
@Controller('planos')
export class HealthPlanController {
  constructor(
    private readonly findAll: FindAllHealthPlansUseCase,
    private readonly findById: FindHealthPlanByIdUseCase,
    private readonly create: CreateHealthPlanUseCase,
    private readonly update: UpdateHealthPlanUseCase,
    private readonly remove: DeleteHealthPlanUseCase,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Listar planos de saúde' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  listAll() {
    return this.findAll.execute();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Buscar plano por ID' })
  @ApiOkResponse({ description: 'Plano encontrado.' })
  @ApiNotFoundResponse({ description: 'Plano não encontrado.' })
  async getOne(@Param('id') id: string) {
    return this.findById.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar plano de saúde (admin)' })
  @ApiCreatedResponse({ description: 'Plano criado.' })
  createOne(@Body() dto: CreateHealthPlanDto) {
    return this.create.execute(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar plano de saúde (admin)' })
  @ApiOkResponse({ description: 'Plano atualizado.' })
  @ApiNotFoundResponse({ description: 'Plano não encontrado.' })
  async updateOne(@Param('id') id: string, @Body() dto: UpdateHealthPlanDto) {
    return this.update.execute({ id, ...dto }).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover plano — soft delete (admin)' })
  @ApiNoContentResponse({ description: 'Plano removido.' })
  @ApiNotFoundResponse({ description: 'Plano não encontrado.' })
  async deleteOne(@Param('id') id: string) {
    return this.remove.execute(id).catch((err: unknown) => {
      if (err instanceof ResourceNotFoundError) throw new NotFoundException(err.message);
      throw err;
    });
  }
}
