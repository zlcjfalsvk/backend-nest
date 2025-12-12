import { Post } from '@prisma-client';

import { CustomError, ERROR_CODES } from '@libs/utils';

import { FindsParams } from './types';

/**
 * Author include 설정 상수
 */
export const AUTHOR_SELECT = {
  id: true,
  nickName: true,
} as const;

export const AUTHOR_INCLUDE = {
  author: {
    select: AUTHOR_SELECT,
  },
} as const;

/**
 * 게시물 쿼리를 위한 where 조건을 생성합니다
 */
export const buildWhereCondition = (
  includeDeleted = false,
  onlyPublished = true,
): { deletedAt: null | undefined; published: boolean | undefined } => {
  return {
    deletedAt: includeDeleted ? undefined : null,
    published: onlyPublished ? true : undefined,
  };
};

/**
 * 여러 게시물을 찾기 위한 쿼리 옵션을 생성합니다
 */
export const buildFindManyQueryOptions = (
  params: FindsParams,
  whereCondition: {
    deletedAt: null | undefined;
    published: boolean | undefined;
  },
): {
  take: number;
  where: {
    deletedAt: null | undefined;
    published: boolean | undefined;
  };
  orderBy: {
    [key: string]: 'asc' | 'desc';
  };
  select: {
    id: boolean;
    title: boolean;
    slug: boolean;
    views: boolean;
    createdAt: boolean;
    author: {
      select: {
        nickName: boolean;
      };
    };
  };
  cursor?: { id: number };
  skip?: number;
} => {
  const {
    cursor,
    take = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const queryOptions = {
    take,
    where: {
      deletedAt: whereCondition.deletedAt,
      published: whereCondition.published,
    },
    orderBy: {
      [sortBy]: sortOrder,
    } as const,
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      createdAt: true,
      author: {
        select: {
          nickName: true,
        },
      },
    },
  };

  if (cursor) {
    Object.assign(queryOptions, {
      cursor: { id: cursor },
      skip: 1,
    });
  }

  return queryOptions;
};

/**
 * 총 개수와 페이지 크기를 기반으로 총 페이지 수를 계산합니다
 */
export const calculateTotalPages = (
  totalCount: number,
  take: number,
): number => {
  return Math.ceil(totalCount / take);
};

/**
 * 게시물이 존재하는지 검증합니다
 *
 * 함수 선언문은 다음과 같이 추가 선언 해줘야 함
 * export const validatePostExists: (
 *   post: Post | null,
 *   id: number,
 * ) => asserts post is Post = (
 *   post: Post | null,
 *   id: number,
 * ): asserts post is Post => {
 *   if (!post) {
 *     throw new CustomError(
 *       ERROR_CODES.POST_NOT_FOUND,
 *       `Post with id ${id} not found`,
 *     );
 *   }
 * };
 */
export function validatePostExists(
  post: Post | null,
  id: number,
): asserts post is Post {
  if (!post) {
    throw new CustomError(
      ERROR_CODES.POST_NOT_FOUND,
      `Post with id ${id} not found`,
    );
  }
}

/**
 * 게시물이 삭제되지 않았는지 검증합니다
 */
export const validatePostNotDeleted = (post: Post): void => {
  if (post.deletedAt) {
    throw new CustomError(
      ERROR_CODES.POST_DELETED,
      `Post with id ${post.id} has been deleted`,
    );
  }
};

/**
 * 슬러그가 고유한지 검증합니다
 */
export const validateSlugUniqueness = (
  existingPost: Post | null,
  slug: string,
): void => {
  if (existingPost) {
    throw new CustomError(
      ERROR_CODES.POST_CONFLICT,
      `Post with slug '${slug}' already exists`,
    );
  }
};
