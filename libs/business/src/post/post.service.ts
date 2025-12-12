import { Injectable } from '@nestjs/common';

import { PrismaService } from '@libs/infrastructure';

import {
  AUTHOR_INCLUDE,
  buildWhereCondition,
  buildFindManyQueryOptions,
  calculateTotalPages,
  validatePostExists,
  validatePostNotDeleted,
  validateSlugUniqueness,
} from './post.helpers';
import {
  CreateParams,
  CreateResponse,
  DeleteResponse,
  FindResponse,
  FindsResponse,
  FindsParams,
  UpdateParams,
  UpdateResponse,
} from './types';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async finds(params: FindsParams = {}): Promise<FindsResponse> {
    const { take = 10, includeDeleted = false, onlyPublished = true } = params;

    const where = buildWhereCondition(includeDeleted, onlyPublished);

    const totalCount = await this.prismaService.post.count({
      where: {
        deletedAt: where.deletedAt,
        published: where.published,
      },
    });

    const queryOptions = buildFindManyQueryOptions(params, where);

    const posts = await this.prismaService.post.findMany(queryOptions);

    const totalPages = calculateTotalPages(totalCount, take);

    return {
      posts,
      totalCount,
      totalPages,
      nextCursor: posts.length > 0 ? posts[posts.length - 1].id : null,
    };
  }

  async find(id: number): Promise<FindResponse> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: AUTHOR_INCLUDE,
    });

    validatePostExists(post, id);
    validatePostNotDeleted(post);

    await this.prismaService.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return {
      ...post,
      views: post.views + 1,
    };
  }

  async create(data: CreateParams): Promise<CreateResponse> {
    const existingPost = await this.prismaService.post.findUnique({
      where: { slug: data.slug },
    });

    validateSlugUniqueness(existingPost, data.slug);

    return this.prismaService.post.create({
      data,
      include: AUTHOR_INCLUDE,
    });
  }

  async update(params: UpdateParams): Promise<UpdateResponse> {
    const { id, ...data } = params;

    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
    });

    validatePostExists(existingPost, id);
    validatePostNotDeleted(existingPost);

    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await this.prismaService.post.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      validateSlugUniqueness(slugExists, data.slug);
    }

    return this.prismaService.post.update({
      where: { id },
      data,
      include: AUTHOR_INCLUDE,
    });
  }

  async delete(id: number): Promise<DeleteResponse> {
    const existingPost = await this.prismaService.post.findUnique({
      where: { id },
    });

    validatePostExists(existingPost, id);
    validatePostNotDeleted(existingPost);

    return this.prismaService.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
