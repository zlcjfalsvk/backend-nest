import { describe, expect, it } from 'vitest';

import {
  createCommentSchema,
  updateCommentSchema,
  getCommentsQuerySchema,
  getCommentSchema,
} from '../comment.schema';

describe('댓글 스키마', () => {
  describe('댓글 생성 스키마', () => {
    it('올바른 댓글 생성 데이터를 검증해야 한다', () => {
      const validData = {
        postId: 1,
        authorId: 'author-123',
        content: 'This is a test comment',
        parentId: 2,
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('선택사항인 parentId 없이도 검증해야 한다', () => {
      const validData = {
        postId: 1,
        authorId: 'author-123',
        content: 'This is a test comment',
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentId).toBeUndefined();
      }
    });

    it('양수가 아닌 postId를 거부해야 한다', () => {
      const invalidData = {
        postId: 0,
        authorId: 'author-123',
        content: 'This is a test comment',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('정수가 아닌 postId를 거부해야 한다', () => {
      const invalidData = {
        postId: 1.5,
        authorId: 'author-123',
        content: 'This is a test comment',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('빈 작성자 ID를 거부해야 한다', () => {
      const invalidData = {
        postId: 1,
        authorId: '',
        content: 'This is a test comment',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('작성자 ID가 필요합니다');
      }
    });

    it('빈 댓글 내용을 거부해야 한다', () => {
      const invalidData = {
        postId: 1,
        authorId: 'author-123',
        content: '',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('댓글 내용을 입력해주세요');
      }
    });

    it('양수가 아닌 parentId를 거부해야 한다', () => {
      const invalidData = {
        postId: 1,
        authorId: 'author-123',
        content: 'This is a test comment',
        parentId: 0,
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('정수가 아닌 parentId를 거부해야 한다', () => {
      const invalidData = {
        postId: 1,
        authorId: 'author-123',
        content: 'This is a test comment',
        parentId: 1.5,
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('댓글 수정 스키마', () => {
    it('올바른 댓글 수정 데이터를 검증해야 한다', () => {
      const validData = {
        id: 1,
        content: 'Updated comment content',
      };

      const result = updateCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('양수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 0,
        content: 'Updated comment content',
      };

      const result = updateCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('정수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 1.5,
        content: 'Updated comment content',
      };

      const result = updateCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('빈 댓글 내용을 거부해야 한다', () => {
      const invalidData = {
        id: 1,
        content: '',
      };

      const result = updateCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('댓글 내용을 입력해주세요');
      }
    });

    it('id가 누락된 경우를 거부해야 한다', () => {
      const invalidData = {
        content: 'Updated comment content',
      };

      const result = updateCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('내용이 누락된 경우를 거부해야 한다', () => {
      const invalidData = {
        id: 1,
      };

      const result = updateCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('댓글 목록 조회 스키마', () => {
    it('모든 쿼리 매개변수와 함께 검증해야 한다', () => {
      const validData = {
        postId: 1,
        cursor: 10,
        take: 20,
        includeDeleted: true,
      };

      const result = getCommentsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('선택 매개변수가 제공되지 않으면 기본값을 사용해야 한다', () => {
      const validData = {
        postId: 1,
      };

      const result = getCommentsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.take).toBe(10);
        expect(result.data.includeDeleted).toBe(false);
        expect(result.data.cursor).toBeUndefined();
      }
    });

    it('양수가 아닌 postId를 거부해야 한다', () => {
      const invalidData = {
        postId: 0,
      };

      const result = getCommentsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('정수가 아닌 postId를 거부해야 한다', () => {
      const invalidData = {
        postId: 1.5,
      };

      const result = getCommentsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('100을 초과하는 take 값을 거부해야 한다', () => {
      const invalidData = {
        postId: 1,
        take: 101,
      };

      const result = getCommentsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('양수가 아닌 cursor를 거부해야 한다', () => {
      const invalidData = {
        postId: 1,
        cursor: 0,
      };

      const result = getCommentsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('양수가 아닌 take를 거부해야 한다', () => {
      const invalidData = {
        postId: 1,
        take: 0,
      };

      const result = getCommentsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('postId가 누락된 경우를 거부해야 한다', () => {
      const invalidData = {
        cursor: 10,
        take: 20,
      };

      const result = getCommentsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('댓글 상세 조회 스키마', () => {
    it('올바른 댓글 id를 검증해야 한다', () => {
      const validData = {
        id: 1,
      };

      const result = getCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('양수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 0,
      };

      const result = getCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('음수 id를 거부해야 한다', () => {
      const invalidData = {
        id: -1,
      };

      const result = getCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('정수가 아닌 id를 거부해야 한다', () => {
      const invalidData = {
        id: 1.5,
      };

      const result = getCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('id가 누락된 경우를 거부해야 한다', () => {
      const invalidData = {};

      const result = getCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
