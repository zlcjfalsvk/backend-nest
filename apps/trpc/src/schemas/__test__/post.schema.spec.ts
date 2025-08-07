import { describe, expect, it } from 'vitest';

import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  getPostSchema,
} from '../post.schema';

describe('게시글 스키마', () => {
  describe('게시글 생성 스키마', () => {
    it('올바른 게시글 생성 데이터를 검증해야 한다', () => {
      const validData = {
        title: 'Test Post',
        content: 'This is test content',
        slug: 'test-post',
        published: true,
        authorId: 'author-123',
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('published가 제공되지 않으면 기본값을 사용해야 한다', () => {
      const validData = {
        title: 'Test Post',
        content: 'This is test content',
        slug: 'test-post',
        authorId: 'author-123',
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.published).toBe(false);
      }
    });

    it('빈 제목을 거부해야 한다', () => {
      const invalidData = {
        title: '',
        content: 'This is test content',
        slug: 'test-post',
        authorId: 'author-123',
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('200자를 초과하는 제목을 거부해야 한다', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        content: 'This is test content',
        slug: 'test-post',
        authorId: 'author-123',
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('제목은 200자 이하로 입력해주세요');
      }
    });

    it('빈 내용을 거부해야 한다', () => {
      const invalidData = {
        title: 'Test Post',
        content: '',
        slug: 'test-post',
        authorId: 'author-123',
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('내용을 입력해주세요');
      }
    });

    it('100자를 초과하는 slug를 거부해야 한다', () => {
      const invalidData = {
        title: 'Test Post',
        content: 'This is test content',
        slug: 'a'.repeat(101),
        authorId: 'author-123',
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('slug는 100자 이하로 입력해주세요');
      }
    });

    it('빈 작성자 ID를 거부해야 한다', () => {
      const invalidData = {
        title: 'Test Post',
        content: 'This is test content',
        slug: 'test-post',
        authorId: '',
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('작성자 ID가 필요합니다');
      }
    });
  });

  describe('게시글 수정 스키마', () => {
    it('올바른 게시글 수정 데이터를 검증해야 한다', () => {
      const validData = {
        id: 1,
        title: 'Updated Post',
        content: 'Updated content',
        slug: 'updated-post',
        published: true,
      };

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('필수 id 필드만 있어도 검증해야 한다', () => {
      const validData = {
        id: 1,
      };

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('양수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 0,
        title: 'Updated Post',
      };

      const result = updatePostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('음수 id를 거부해야 한다', () => {
      const invalidData = {
        id: -1,
        title: 'Updated Post',
      };

      const result = updatePostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('정수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 1.5,
        title: 'Updated Post',
      };

      const result = updatePostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('일부 선택 필드만 포함한 부분 업데이트를 검증해야 한다', () => {
      const validData = {
        id: 1,
        title: 'Updated Title',
        published: false,
      };

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('게시글 목록 조회 스키마', () => {
    it('모든 쿼리 매개변수와 함께 검증해야 한다', () => {
      const validData = {
        cursor: 10,
        take: 20,
        includeDeleted: true,
        onlyPublished: false,
        sortBy: 'views',
        sortOrder: 'asc',
      };

      const result = getPostsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('매개변수가 제공되지 않으면 기본값을 사용해야 한다', () => {
      const validData = {};

      const result = getPostsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.take).toBe(10);
        expect(result.data.includeDeleted).toBe(false);
        expect(result.data.onlyPublished).toBe(true);
        expect(result.data.sortBy).toBe('createdAt');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('100을 초과하는 take 값을 거부해야 한다', () => {
      const invalidData = {
        take: 101,
      };

      const result = getPostsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('양수가 아닌 cursor를 거부해야 한다', () => {
      const invalidData = {
        cursor: 0,
      };

      const result = getPostsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('잘못된 sortBy 값을 거부해야 한다', () => {
      const invalidData = {
        sortBy: 'invalidSort',
      };

      const result = getPostsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('잘못된 sortOrder 값을 거부해야 한다', () => {
      const invalidData = {
        sortOrder: 'invalidOrder',
      };

      const result = getPostsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('게시글 상세 조회 스키마', () => {
    it('올바른 게시글 id를 검증해야 한다', () => {
      const validData = {
        id: 1,
      };

      const result = getPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('양수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 0,
      };

      const result = getPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('음수 id를 거부해야 한다', () => {
      const invalidData = {
        id: -1,
      };

      const result = getPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('정수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 1.5,
      };

      const result = getPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('id가 누락된 경우를 거부해야 한다', () => {
      const invalidData = {};

      const result = getPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});