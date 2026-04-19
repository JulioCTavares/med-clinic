import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { AssociatePatientHealthPlanDto } from '@/core/application/dtos/associate-patient-health-plan.dto';
import { AssociatePatientHealthPlanUseCase } from '@/core/application/use-cases/associate-patient-health-plan.use-case';
import { ListPatientHealthPlansUseCase } from '@/core/application/use-cases/list-patient-health-plans.use-case';
import { RemovePatientHealthPlanUseCase } from '@/core/application/use-cases/remove-patient-health-plan.use-case';

@ApiBearerAuth()
@ApiTags('Patient Health Plans')
@Controller('patients/:patientId/health-plans')
export class PatientHealthPlanController {
  constructor(
    private readonly associate: AssociatePatientHealthPlanUseCase,
    private readonly list: ListPatientHealthPlansUseCase,
    private readonly remove: RemovePatientHealthPlanUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.PATIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Associar paciente a um plano de saúde' })
  @ApiCreatedResponse({ description: 'Associação criada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Acesso negado — requer role admin ou patient.' })
  @ApiNotFoundResponse({ description: 'Paciente ou plano de saúde não encontrado.' })
  create(@Param('patientId') patientId: string, @Body() dto: AssociatePatientHealthPlanDto) {
    return this.associate.execute({ patientId, ...dto });
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Listar planos de saúde do paciente' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Acesso negado.' })
  @ApiNotFoundResponse({ description: 'Paciente não encontrado.' })
  listAll(@Param('patientId') patientId: string) {
    return this.list.execute(patientId);
  }

  @Delete(':healthPlanId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover associação paciente ↔ plano de saúde (admin)' })
  @ApiNoContentResponse({ description: 'Associação removida com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Acesso negado — requer role admin.' })
  @ApiNotFoundResponse({ description: 'Associação não encontrada.' })
  deleteOne(
    @Param('patientId') patientId: string,
    @Param('healthPlanId') healthPlanId: string,
  ) {
    return this.remove.execute(patientId, healthPlanId);
  }
}
