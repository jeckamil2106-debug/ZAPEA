import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =========================================================
  // CARPETA DE ARCHIVOS SUBIDOS
  // =========================================================

  const uploadsPath = join(process.cwd(), 'uploads');

  app.use(
    '/uploads',
    express.static(uploadsPath),
  );

  // =========================================================
  // CORS
  // =========================================================

app.enableCors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.18.42:5173',
    'http://192.168.18.42:5174',
  ],
});

  // =========================================================
  // VALIDACIÓN GLOBAL
  // =========================================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // =========================================================
  // SWAGGER
  // =========================================================

    const config = new DocumentBuilder()
  .setTitle('ZAPEA API')
  .setDescription('API de ZAPEA')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',
  )
  .build();

if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup('api', app, document);
}

  // =========================================================
  // PUERTO
  // =========================================================

  await app.listen(3000, "0.0.0.0");

}

bootstrap();