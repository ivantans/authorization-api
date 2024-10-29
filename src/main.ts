import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableVersioning({ 
    prefix: "api/v",
    type: VersioningType.URI 
  })
  await app.listen(3000);
}
bootstrap();
