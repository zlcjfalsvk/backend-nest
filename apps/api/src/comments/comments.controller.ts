import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CommentService } from '@libs/business';

import {
  CreateCommentDto,
  UpdateCommentDto,
  GetCommentsQueryDto,
} from './dtos';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: GetCommentsQueryDto,
  ) {
    return this.commentService.findsByPostId({
      postId,
      ...query,
    });
  }

  @Get(':id')
  async getComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.find(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Put(':id')
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update({ id, ...updateCommentDto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id', ParseIntPipe) id: number) {
    await this.commentService.delete(id);
  }
}
