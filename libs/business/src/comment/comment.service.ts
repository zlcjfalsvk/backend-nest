import { Injectable } from '@nestjs/common';

import { PrismaService } from '@libs/infrastructure';
import { CustomError, ERROR_CODES } from '@libs/utils';

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

    // 포스트 존재 여부 확인
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new CustomError(
        ERROR_CODES.POST_NOT_FOUND,
        `포스트를 찾을 수 없습니다. (ID: ${postId})`,
      );
    }

    const where = {
      postId,
      deletedAt: includeDeleted ? undefined : null,
    };

    const totalCount = await this.prismaService.comment.count({ where });

    const queryOptions = {
      where,
      take,
      orderBy: { createdAt: sortOrder },
      include: {
        author: {
          select: {
            id: true,
            nickName: true,
          },
        },
      },
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
      include: {
        author: {
          select: {
            id: true,
            nickName: true,
          },
        },
      },
    });

    if (!comment) {
      throw new CustomError(
        ERROR_CODES.COMMENT_NOT_FOUND,
        `댓글을 찾을 수 없습니다. (ID: ${id})`,
      );
    }

    if (comment.deletedAt) {
      throw new CustomError(ERROR_CODES.COMMENT_DELETED, '삭제된 댓글입니다.');
    }

    return comment;
  }

  async create(data: CreateParams): Promise<CreateResponse> {
    // 포스트 존재 여부 확인
    const post = await this.prismaService.post.findUnique({
      where: { id: data.postId },
    });

    if (!post) {
      throw new CustomError(
        ERROR_CODES.POST_NOT_FOUND,
        `포스트를 찾을 수 없습니다. (ID: ${data.postId})`,
      );
    }

    if (post.deletedAt) {
      throw new CustomError(
        ERROR_CODES.POST_DELETED,
        '삭제된 포스트에는 댓글을 작성할 수 없습니다.',
      );
    }

    return this.prismaService.comment.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            nickName: true,
          },
        },
      },
    });
  }

  async update(params: UpdateParams): Promise<UpdateResponse> {
    const { id, ...data } = params;

    const existingComment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      throw new CustomError(
        ERROR_CODES.COMMENT_NOT_FOUND,
        `댓글을 찾을 수 없습니다. (ID: ${id})`,
      );
    }

    if (existingComment.deletedAt) {
      throw new CustomError(
        ERROR_CODES.COMMENT_DELETED,
        '삭제된 댓글은 수정할 수 없습니다.',
      );
    }

    return this.prismaService.comment.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            nickName: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<DeleteResponse> {
    const existingComment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      throw new CustomError(
        ERROR_CODES.COMMENT_NOT_FOUND,
        `댓글을 찾을 수 없습니다. (ID: ${id})`,
      );
    }

    if (existingComment.deletedAt) {
      throw new CustomError(
        ERROR_CODES.COMMENT_ALREADY_DELETED,
        '이미 삭제된 댓글입니다.',
      );
    }

    return this.prismaService.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
