import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDrizzleConnection, DrizzleDB } from './drizzle/drizzle.factory';

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DrizzleDB => {
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
        return createDrizzleConnection(databaseUrl);
      },
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
