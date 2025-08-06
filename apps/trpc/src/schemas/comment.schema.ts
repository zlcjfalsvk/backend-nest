import { z } from 'zod';

/**
 * 댓글 생성 요청 스키마
 */
export const createCommentSchema = z.object({
  postId: z.number().int().positive(),
  authorId: z.string().min(1, '작성자 ID가 필요합니다'),
  content: z.string().min(1, '댓글 내용을 입력해주세요'),
  parentId: z.number().int().positive().optional(),
});

/**
 * 댓글 업데이트 요청 스키마
 */
export const updateCommentSchema = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1, '댓글 내용을 입력해주세요'),
});

/**
 * 댓글 조회 쿼리 스키마
 */
export const getCommentsQuerySchema = z.object({
  postId: z.number().int().positive(),
  cursor: z.number().int().positive().optional(),
  take: z.number().int().positive().max(100).optional().default(10),
  includeDeleted: z.boolean().optional().default(false),
});

/**
 * 댓글 상세 조회 스키마
 */
export const getCommentSchema = z.object({
  id: z.number().int().positive(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type GetCommentsQueryInput = z.infer<typeof getCommentsQuerySchema>;
export type GetCommentInput = z.infer<typeof getCommentSchema>;
