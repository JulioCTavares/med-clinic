import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ConflictException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Public } from '@/infrastructure/security/decorators/public.decorator';
import { RegisterDoctorDto } from '@/core/application/dtos/register-doctor.dto';
import { RegisterPatientDto } from '@/core/application/dtos/register-patient.dto';
import { LoginDto } from '@/core/application/dtos/login.dto';
import { RefreshTokenDto } from '@/core/application/dtos/refresh-token.dto';
import { RegisterDoctorUseCase } from '@/core/application/use-cases/register-doctor.use-case';
import { RegisterPatientUseCase } from '@/core/application/use-cases/register-patient.use-case';
import { LoginUseCase } from '@/core/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@/core/application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@/core/application/use-cases/logout.use-case';
import { EmailAlreadyInUseError, InvalidCredentialsError, InvalidRefreshTokenError } from '@/core/application/errors/application.error';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerDoctor: RegisterDoctorUseCase,
    private readonly registerPatient: RegisterPatientUseCase,
    private readonly login: LoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário', description: 'Verifica credenciais e retorna um Bearer token JWT.' })
  @ApiBody({
    type: LoginDto,
    examples: {
      exemplo: {
        summary: 'Login básico',
        value: { email: 'joao.silva@clinica.com', password: 'Senha@123' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Autenticado com sucesso.',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  @ApiBadRequestResponse({ description: 'Payload inválido (validação Zod).' })
  async loginUser(@Body() dto: LoginDto) {
    return this.login.execute(dto).catch((err: unknown) => {
      if (err instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    });
  }

  @Public()
  @Post('register/doctor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar médico', description: 'Cria um usuário com role `doctor` e o perfil de médico vinculado.' })
  @ApiBody({
    type: RegisterDoctorDto,
    examples: {
      exemplo_basico: {
        summary: 'Cadastro mínimo',
        value: {
          email: 'joao.silva@clinica.com',
          password: 'Senha@123',
          name: 'Dr. João Silva',
          crm: 'CRM/SP 123456',
          specialtyId: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Médico cadastrado com sucesso.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'joao.silva@clinica.com',
        role: 'doctor',
        doctor: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Dr. João Silva',
          crm: 'CRM/SP 123456',
          specialtyId: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'E-mail já está em uso.' })
  @ApiBadRequestResponse({ description: 'Payload inválido (validação Zod).' })
  async doctor(@Body() dto: RegisterDoctorDto) {
    const { user, doctor } = await this.registerDoctor
      .execute(dto)
      .catch((err: unknown) => {
        if (err instanceof EmailAlreadyInUseError) {
          throw new ConflictException(err.message);
        }
        throw err;
      });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        crm: doctor.crm,
        specialtyId: doctor.specialtyId,
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens', description: 'Valida o refresh token e emite novos access token e refresh token (rotation).' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Tokens renovados com sucesso.',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido ou expirado.' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshToken.execute(dto).catch((err: unknown) => {
      if (err instanceof InvalidRefreshTokenError) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Encerrar sessão', description: 'Invalida o access token na blacklist e remove o refresh token do Redis.' })
  @ApiOkResponse({ description: 'Logout realizado com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  async logoutUser(@Req() req: FastifyRequest) {
    const { id, jti, exp } = req.user!;
    await this.logout.execute({ userId: id, jti, exp });
  }

  @Public()
  @Post('register/patient')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar paciente', description: 'Cria um usuário com role `patient` e o perfil de paciente vinculado.' })
  @ApiBody({
    type: RegisterPatientDto,
    examples: {
      exemplo_completo: {
        summary: 'Cadastro com dados opcionais',
        value: {
          email: 'maria.souza@email.com',
          password: 'Senha@123',
          name: 'Maria Souza',
          birthDate: '1990-05-15',
          phones: ['(11) 91234-5678', '(11) 3456-7890'],
        },
      },
      exemplo_minimo: {
        summary: 'Cadastro mínimo (sem data e telefones)',
        value: {
          email: 'pedro.lima@email.com',
          password: 'Senha@123',
          name: 'Pedro Lima',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Paciente cadastrado com sucesso.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'maria.souza@email.com',
        role: 'patient',
        patient: {
          id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Maria Souza',
          birthDate: '1990-05-15',
          phones: ['(11) 91234-5678'],
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'E-mail já está em uso.' })
  @ApiBadRequestResponse({ description: 'Payload inválido (validação Zod).' })
  async patient(@Body() dto: RegisterPatientDto) {
    const { user, patient } = await this.registerPatient
      .execute(dto)
      .catch((err: unknown) => {
        if (err instanceof EmailAlreadyInUseError) {
          throw new ConflictException(err.message);
        }
        throw err;
      });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      patient: {
        id: patient.id,
        name: patient.name,
        birthDate: patient.birthDate,
        phones: patient.phones,
      },
    };
  }
}
