import { describe, expect, it } from 'vitest';

import { Post } from '@prisma-client';

import { CustomError } from '@libs/utils';

import {
  buildWhereCondition,
  buildFindManyQueryOptions,
  calculateTotalPages,
  validatePostExists,
  validatePostNotDeleted,
  validateSlugUniqueness,
} from '../post.helpers';
import { FindsParams } from '../types';

describe('PostHelper', () => {
  // buildWhereCondition 함수 테스트
  describe('buildWhereCondition', () => {
    it('기본값으로 삭제되지 않은 게시물과 게시된 게시물만 포함하는 조건을 반환해야 한다', () => {
      // Act
      const result = buildWhereCondition();

      // Assert
      expect(result).toEqual({
        deletedAt: null,
        published: true,
      });
    });

    it('삭제된 게시물을 포함하도록 설정하면 deletedAt이 undefined여야 한다', () => {
      // Act
      const result = buildWhereCondition(true);

      // Assert
      expect(result).toEqual({
        deletedAt: undefined,
        published: true,
      });
    });

    it('게시되지 않은 게시물을 포함하도록 설정하면 published가 undefined여야 한다', () => {
      // Act
      const result = buildWhereCondition(false, false);

      // Assert
      expect(result).toEqual({
        deletedAt: null,
        published: undefined,
      });
    });

    it('삭제된 게시물과 게시되지 않은 게시물을 모두 포함하도록 설정하면 두 필드 모두 undefined여야 한다', () => {
      // Act
      const result = buildWhereCondition(true, false);

      // Assert
      expect(result).toEqual({
        deletedAt: undefined,
        published: undefined,
      });
    });
  });

  // buildFindManyQueryOptions 함수 테스트
  describe('buildFindManyQueryOptions', () => {
    it('기본 매개변수로 올바른 쿼리 옵션을 생성해야 한다', () => {
      // Arrange
      const params: FindsParams = {};
      const whereCondition = buildWhereCondition();

      // Act
      const result = buildFindManyQueryOptions(params, whereCondition);

      // Assert
      expect(result).toEqual({
        take: 10,
        where: {
          deletedAt: null,
          published: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
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
      });
    });

    it('커스텀 매개변수로 올바른 쿼리 옵션을 생성해야 한다', () => {
      // Arrange
      const params: FindsParams = {
        take: 20,
        sortBy: 'views',
        sortOrder: 'asc',
      };
      const whereCondition = buildWhereCondition(true, false);

      // Act
      const result = buildFindManyQueryOptions(params, whereCondition);

      // Assert
      expect(result).toEqual({
        take: 20,
        where: {
          deletedAt: undefined,
          published: undefined,
        },
        orderBy: {
          views: 'asc',
        },
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
      });
    });

    it('커서가 제공되면 커서 관련 옵션을 포함해야 한다', () => {
      // Arrange
      const params: FindsParams = {
        cursor: 5,
      };
      const whereCondition = buildWhereCondition();

      // Act
      const result = buildFindManyQueryOptions(params, whereCondition);

      // Assert
      expect(result).toHaveProperty('cursor', { id: 5 });
      expect(result).toHaveProperty('skip', 1);
    });
  });

  // calculateTotalPages 함수 테스트
  describe('calculateTotalPages', () => {
    it('총 개수가 페이지 크기의 배수일 때 올바른 페이지 수를 계산해야 한다', () => {
      // Act
      const result = calculateTotalPages(20, 10);

      // Assert
      expect(result).toBe(2);
    });

    it('총 개수가 페이지 크기의 배수가 아닐 때 올바른 페이지 수를 계산해야 한다', () => {
      // Act
      const result = calculateTotalPages(25, 10);

      // Assert
      expect(result).toBe(3);
    });

    it('총 개수가 0일 때 페이지 수는 0이어야 한다', () => {
      // Act
      const result = calculateTotalPages(0, 10);

      // Assert
      expect(result).toBe(0);
    });

    it('총 개수가 페이지 크기보다 작을 때 페이지 수는 1이어야 한다', () => {
      // Act
      const result = calculateTotalPages(5, 10);

      // Assert
      expect(result).toBe(1);
    });
  });

  // validatePostExists 함수 테스트
  describe('validatePostExists', () => {
    it('게시물이 존재하면 오류를 발생시키지 않아야 한다', () => {
      // Arrange
      const post = { id: 1 } as Post;

      // Act & Assert
      expect(() => validatePostExists(post, 1)).not.toThrow();
    });

    it('게시물이 존재하지 않으면 POST_NOT_FOUND 오류를 발생시켜야 한다', () => {
      // Arrange
      const post = null;
      const postId = 1;

      // Act & Assert
      expect(() => validatePostExists(post, postId)).toThrow(CustomError);
      expect(() => validatePostExists(post, postId)).toThrow(
        `Post with id ${postId} not found`,
      );
    });
  });

  // validatePostNotDeleted 함수 테스트
  describe('validatePostNotDeleted', () => {
    it('게시물이 삭제되지 않았으면 오류를 발생시키지 않아야 한다', () => {
      // Arrange
      const post = { id: 1, deletedAt: null } as Post;

      // Act & Assert
      expect(() => validatePostNotDeleted(post)).not.toThrow();
    });

    it('게시물이 삭제되었으면 POST_DELETED 오류를 발생시켜야 한다', () => {
      // Arrange
      const post = { id: 1, deletedAt: new Date() } as Post;

      // Act & Assert
      expect(() => validatePostNotDeleted(post)).toThrow(CustomError);
      expect(() => validatePostNotDeleted(post)).toThrow(
        `Post with id ${post.id} has been deleted`,
      );
    });
  });

  // validateSlugUniqueness 함수 테스트
  describe('validateSlugUniqueness', () => {
    it('슬러그가 고유하면 오류를 발생시키지 않아야 한다', () => {
      // Arrange
      const existingPost = null;
      const slug = 'unique-slug';

      // Act & Assert
      expect(() => validateSlugUniqueness(existingPost, slug)).not.toThrow();
    });

    it('슬러그가 이미 존재하면 POST_CONFLICT 오류를 발생시켜야 한다', () => {
      // Arrange
      const existingPost = { id: 1 } as Post;
      const slug = 'duplicate-slug';

      // Act & Assert
      expect(() => validateSlugUniqueness(existingPost, slug)).toThrow(
        CustomError,
      );
      expect(() => validateSlugUniqueness(existingPost, slug)).toThrow(
        `Post with slug '${slug}' already exists`,
      );
    });
  });
});
