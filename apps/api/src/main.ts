import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Turnix API')
    .setDescription('HTTP API documentation for the Turnix platform.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Backoffice access token.',
      },
      'backofficeAuth',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = Number.parseInt(process.env.PORT ?? '3001', 10);

  await app.listen(port);
  Logger.log(`Turnix API listening on http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `Swagger docs available at http://localhost:${port}/docs`,
    'Bootstrap',
  );
}

void bootstrap();
