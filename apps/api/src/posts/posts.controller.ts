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
import {
  AuthorOwnershipGuard,
  plainToInstance,
  plainArrayToInstance,
} from '@libs/utils';

import {
  CreatePostDto,
  UpdatePostDto,
  GetPostsQueryDto,
  PostResponseDto,
  PostsResponseDto,
} from './dtos';
import { AccessTokenGuard } from '../auth/guards';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryDto): Promise<PostsResponseDto> {
    const result = await this.postService.finds(query);
    const response = plainToInstance(PostsResponseDto, {
      ...result,
      posts: plainArrayToInstance(PostResponseDto, result.posts),
    });
    // Ensure null values are preserved
    response.nextCursor = result.nextCursor;
    return response;
  }

  @Get(':id')
  async getPost(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostResponseDto> {
    const result = await this.postService.find(id);
    return plainToInstance(PostResponseDto, result);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const result = await this.postService.create(createPostDto);
    return plainToInstance(PostResponseDto, result);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const result = await this.postService.update({ id, ...updatePostDto });
    return plainToInstance(PostResponseDto, result);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    await this.postService.delete(id);
  }
}
