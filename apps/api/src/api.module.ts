import { Module } from '@nestjs/common';

import { ConfigModule, PrismaModule } from '@libs/infrastructure';

import { AuthControllerModule } from './auth/auth.controller.module';
import { CommentsControllerModule } from './comments/comments.controller.module';
import { PostsControllerModule } from './posts/posts.controller.module';

@Module({
  imports: [
    ConfigModule.forRoot('api'),
    PrismaModule,
    AuthControllerModule,
    PostsControllerModule,
    CommentsControllerModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
