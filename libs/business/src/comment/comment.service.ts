import { Injectable } from '@nestjs/common';

import { PrismaService } from '@libs/infrastructure';

import {
  AUTHOR_INCLUDE,
  validateCommentExists,
  validateCommentNotAlreadyDeleted,
  validateCommentNotDeleted,
  validatePostExists,
  validatePostNotDeleted,
} from './comment.helpers';
import {
  CreateParams,
  CreateResponse,
  DeleteResponse,
  FindResponse,
  FindsByPostIdParams,
  FindsByPostIdResponse,
  UpdateParams,
  UpdateResponse,
} from './types';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findsByPostId(
    params: FindsByPostIdParams,
  ): Promise<FindsByPostIdResponse> {
    const {
      postId,
      take = 20,
      includeDeleted = false,
      sortOrder = 'asc',
    } = params;

    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    validatePostExists(post, postId);

    const where = {
      postId,
      deletedAt: includeDeleted ? undefined : null,
    };

    const totalCount = await this.prismaService.comment.count({ where });

    const queryOptions = {
      where,
      take,
      orderBy: { createdAt: sortOrder },
      include: AUTHOR_INCLUDE,
      ...(params.cursor && {
        cursor: { id: params.cursor },
        skip: 1,
      }),
    };

    const comments = await this.prismaService.comment.findMany(queryOptions);

    return {
      comments,
      totalCount,
      nextCursor: comments.length > 0 ? comments[comments.length - 1].id : null,
    };
  }

  async find(id: number): Promise<FindResponse> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
      include: AUTHOR_INCLUDE,
    });

    validateCommentExists(comment, id);
    validateCommentNotDeleted(comment);

    return comment;
  }

  async create(data: CreateParams): Promise<CreateResponse> {
    const post = await this.prismaService.post.findUnique({
      where: { id: data.postId },
    });

    validatePostExists(post, data.postId);
    validatePostNotDeleted(post);

    return this.prismaService.comment.create({
      data,
      include: AUTHOR_INCLUDE,
    });
  }

  async update(params: UpdateParams): Promise<UpdateResponse> {
    const { id, ...data } = params;

    const existingComment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    validateCommentExists(existingComment, id);
    validateCommentNotDeleted(existingComment);

    return this.prismaService.comment.update({
      where: { id },
      data,
      include: AUTHOR_INCLUDE,
    });
  }

  async delete(id: number): Promise<DeleteResponse> {
    const existingComment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    validateCommentExists(existingComment, id);
    validateCommentNotAlreadyDeleted(existingComment);

    return this.prismaService.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
