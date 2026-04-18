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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/infrastructure/security/decorators/roles.decorator';
import { Role } from '@/core/domain/enums/role.enum';
import { AssociatePatientHealthPlanDto } from '@/core/application/dtos/associate-patient-health-plan.dto';
import { AssociatePatientHealthPlanUseCase } from '@/core/application/use-cases/associate-patient-health-plan.use-case';
import { ListPatientHealthPlansUseCase } from '@/core/application/use-cases/list-patient-health-plans.use-case';
import { RemovePatientHealthPlanUseCase } from '@/core/application/use-cases/remove-patient-health-plan.use-case';

@ApiBearerAuth()
@ApiTags('Pacientes / Planos de Saúde')
@Controller('pacientes/:patientId/planos')
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
  create(@Param('patientId') patientId: string, @Body() dto: AssociatePatientHealthPlanDto) {
    return this.associate.execute({ patientId, ...dto });
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Listar planos de saúde do paciente' })
  @ApiOkResponse({ description: 'Lista retornada com sucesso.' })
  listAll(@Param('patientId') patientId: string) {
    return this.list.execute(patientId);
  }

  @Delete(':healthPlanId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover associação paciente ↔ plano de saúde (admin)' })
  @ApiNoContentResponse({ description: 'Associação removida com sucesso.' })
  deleteOne(
    @Param('patientId') patientId: string,
    @Param('healthPlanId') healthPlanId: string,
  ) {
    return this.remove.execute(patientId, healthPlanId);
  }
}
