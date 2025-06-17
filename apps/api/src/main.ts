import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { HttpFilter } from '@libs/utils';

import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  app.useGlobalFilters(new HttpFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        return new BadRequestException({
          errors,
        });
      },
    }),
  );

  await app.listen(process.env.port ?? 3000);
}

void bootstrap();
