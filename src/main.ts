import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, ValidationPipe, INestApplication } from '@nestjs/common';
import fastifyMultipart from '@fastify/multipart';
import { ValidationConfig } from './configs/validation.config';

async function bootstrap() {
  Logger.log('Creating NestFastifyApplication...');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ maxParamLength: 100000 }),
    {
      rawBody: true,
    },
  );
  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });
  app.register(fastifyMultipart as any);

  // ------------- Config ---------------

  const port = process.env.PORT || 8080;
  const host = `http://localhost:${port}`;
  // -------------------------------------------

  // -------------- Global --------------
  app.useGlobalPipes(new ValidationPipe(ValidationConfig));

  //--------------- Dev ----------------
  ConfigDocument(app, `/docs`);

  await app.listen({ port: Number(port), host: '0.0.0.0' }, async () => {
    Logger.log(`==========================================================`);
    Logger.log(`🚀 Application is running on: ${host}`);
    Logger.log(`Swagger: ${host}/docs`);
    Logger.log(`==========================================================`);
  });
}
bootstrap();

function ConfigDocument(app: INestApplication, path: string) {
  const config = new DocumentBuilder()
    .setTitle('GymMax API')
    .setDescription('GymMax API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, document);
  Logger.log(`==========================================================`);
  Logger.log(`Swagger Init: ${path}`, ConfigDocument.name);
  Logger.log(`==========================================================`);
}
