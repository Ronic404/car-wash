import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
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
  await app.listen(process.env.PORT ?? 3200);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
