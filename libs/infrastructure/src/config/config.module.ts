import { DynamicModule, Module } from '@nestjs/common';

import { ConfigService, ServerType } from './config.service';

@Module({})
export class ConfigModule {
  static forRoot(serverType: ServerType = 'api'): DynamicModule {
    return {
      global: true,
      module: ConfigModule,
      providers: [
        {
          provide: ConfigService,
          useFactory: () => new ConfigService(serverType),
        },
      ],
      exports: [ConfigService],
    };
  }
}
