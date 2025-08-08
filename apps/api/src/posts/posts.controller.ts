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

import { PostService } from '@libs/business';
import { AuthorOwnershipGuard } from '@libs/utils';

import { CreatePostDto, UpdatePostDto, GetPostsQueryDto } from './dtos';
import { AccessTokenGuard } from '../auth/guards';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryDto) {
    return this.postService.finds(query);
  }

  @Get(':id')
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.find(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update({ id, ...updatePostDto });
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    await this.postService.delete(id);
  }
}
