import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { IncomingMessage } from 'node:http';
import { randomUUID } from 'node:crypto';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      genReqId: (request: IncomingMessage) => {
        const requestId = request.headers['x-request-id'];

        if (typeof requestId === 'string' && requestId.length > 0) {
          return requestId;
        }

        if (Array.isArray(requestId) && requestId.length > 0) {
          return requestId[0];
        }

        return randomUUID();
      },
      requestIdHeader: 'x-request-id',
      logger: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers.set-cookie',
          ],
          remove: true,
        },
      },
    }),
  );

  const configService = app.get(ConfigService);

  await app.register(fastifyCookie, {
    secret: configService.get<string>('COOKIE_SECRET'),
  });

  await app.register(fastifyHelmet, {
    global: true,
  });

  await app.register(fastifyCors, {
    origin: configService.get<string>('CORS_ORIGIN') ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
  });

  const port = configService.get<number>('PORT') ?? 4000;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
