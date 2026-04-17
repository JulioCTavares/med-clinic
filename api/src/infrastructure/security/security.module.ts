import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@/infrastructure/security/jwt/jwt.strategy';
import { JwtTokenAdapter } from '@/infrastructure/security/jwt/jwt-token.adapter';
import { ACCESS_TOKEN_SERVICE, REFRESH_TOKEN_SERVICE } from '@/core/domain/interfaces/token-service.interface';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '15m') as never },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: ACCESS_TOKEN_SERVICE,
      inject: [ConfigService, JwtService],
      useFactory: (config: ConfigService, jwt: JwtService) =>
        new JwtTokenAdapter(
          jwt,
          config.getOrThrow<string>('JWT_SECRET'),
          config.get<string>('JWT_EXPIRES_IN') ?? '15m',
        ),
    },
    {
      provide: REFRESH_TOKEN_SERVICE,
      inject: [ConfigService, JwtService],
      useFactory: (config: ConfigService, jwt: JwtService) =>
        new JwtTokenAdapter(
          jwt,
          config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
          config.get<string>('REFRESH_TOKEN_EXPIRES_IN') ?? '7d',
        ),
    },
  ],
  exports: [ACCESS_TOKEN_SERVICE, REFRESH_TOKEN_SERVICE, JwtModule, PassportModule],
})
export class SecurityModule {}
