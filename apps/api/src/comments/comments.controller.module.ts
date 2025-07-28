import { Module } from '@nestjs/common';

import { CommentModule } from '@libs/business';

import { CommentsController } from './comments.controller';

@Module({
  imports: [CommentModule],
  controllers: [CommentsController],
})
export class CommentsControllerModule {}
