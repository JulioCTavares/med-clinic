import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
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

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
