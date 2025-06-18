import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@libs/infrastructure';
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

  const config = app.get<ConfigService>(ConfigService);
  const port = config.get('API_PORT');
  await app.listen(port);
}

void bootstrap();
