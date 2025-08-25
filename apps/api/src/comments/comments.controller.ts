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
  UseGuards,
} from '@nestjs/common';

import { CommentService } from '@libs/business';
import {
  AuthorOwnershipGuard,
  plainToInstance,
  plainArrayToInstance,
} from '@libs/utils';

import {
  CreateCommentDto,
  UpdateCommentDto,
  GetCommentsQueryDto,
  CommentResponseDto,
  CommentsResponseDto,
} from './dtos';
import { AccessTokenGuard } from '../auth/guards';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: GetCommentsQueryDto,
  ): Promise<CommentsResponseDto> {
    const result = await this.commentService.findsByPostId({
      postId,
      ...query,
    });
    const response = plainToInstance(CommentsResponseDto, {
      ...result,
      comments: plainArrayToInstance(CommentResponseDto, result.comments),
    });
    // Ensure null values are preserved
    response.nextCursor = result.nextCursor;
    return response;
  }

  @Get(':id')
  async getComment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto> {
    const result = await this.commentService.find(id);
    return plainToInstance(CommentResponseDto, result);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const result = await this.commentService.create(createCommentDto);
    return plainToInstance(CommentResponseDto, result);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const result = await this.commentService.update({
      id,
      ...updateCommentDto,
    });
    return plainToInstance(CommentResponseDto, result);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id', ParseIntPipe) id: number) {
    await this.commentService.delete(id);
  }
}
