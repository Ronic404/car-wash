import './types/express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

const API_PREFIX = 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      // Удаляет из входящих данных поля, которых нет в DTO
      whitelist: true,
      // Превращает plain-объект запроса в экземпляр DTO и включает трансформации
      transform: true,
      transformOptions: {
        // Неявно конвертирует типы по типам в DTO (например "1" -> 1 для number)
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Car Wash API')
    .setDescription('Car Wash API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('car-wash')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, documentFactory, {
    // Ссылка на скачивание спецификации OpenAPI в формате YAML
    yamlDocumentUrl: `${API_PREFIX}/docs.yaml`,
  });

  const port = configService.get<number>('API_PORT', 3200);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
