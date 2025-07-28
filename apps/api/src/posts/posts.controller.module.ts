import { Module } from '@nestjs/common';

import { PostModule } from '@libs/business';

import { PostsController } from './posts.controller';

@Module({
  imports: [PostModule],
  controllers: [PostsController],
})
export class PostsControllerModule {}
