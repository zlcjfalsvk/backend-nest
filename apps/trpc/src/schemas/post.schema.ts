import { z } from 'zod';

/**
 * 게시글 생성 요청 스키마
 */
export const createPostSchema = z.object({
  title: z.string().min(1).max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  slug: z.string().min(1).max(100, 'slug는 100자 이하로 입력해주세요'),
  published: z.boolean().optional().default(false),
  authorId: z.string().min(1, '작성자 ID가 필요합니다'),
});

/**
 * 게시글 업데이트 요청 스키마
 */
export const updatePostSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).max(100).optional(),
  published: z.boolean().optional(),
});

/**
 * 게시글 조회 쿼리 스키마
 */
export const getPostsQuerySchema = z.object({
  cursor: z.number().int().positive().optional(),
  take: z.number().int().positive().max(100).optional().default(10),
  includeDeleted: z.boolean().optional().default(false),
  onlyPublished: z.boolean().optional().default(true),
  sortBy: z.enum(['views', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * 게시글 상세 조회 스키마
 */
export const getPostSchema = z.object({
  id: z.number().int().positive(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostsQueryInput = z.infer<typeof getPostsQuerySchema>;
export type GetPostInput = z.infer<typeof getPostSchema>;
