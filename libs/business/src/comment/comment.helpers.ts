import { Comment, Post } from '@prisma-client';

import { CustomError, ERROR_CODES } from '@libs/utils';

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
 * 포스트가 존재하는지 검증합니다
 */
export function validatePostExists(
  post: Post | null,
  postId: number,
): asserts post is Post {
  if (!post) {
    throw new CustomError(
      ERROR_CODES.POST_NOT_FOUND,
      `Post with id ${postId} not found`,
    );
  }
}

/**
 * 포스트가 삭제되지 않았는지 검증합니다
 */
export function validatePostNotDeleted(post: Post): void {
  if (post.deletedAt) {
    throw new CustomError(
      ERROR_CODES.POST_DELETED,
      'Cannot add comment to deleted post',
    );
  }
}

/**
 * 댓글이 존재하는지 검증합니다
 */
export function validateCommentExists(
  comment: Comment | null,
  id: number,
): asserts comment is Comment {
  if (!comment) {
    throw new CustomError(
      ERROR_CODES.COMMENT_NOT_FOUND,
      `Comment with id ${id} not found`,
    );
  }
}

/**
 * 댓글이 삭제되지 않았는지 검증합니다
 */
export function validateCommentNotDeleted(comment: Comment): void {
  if (comment.deletedAt) {
    throw new CustomError(
      ERROR_CODES.COMMENT_DELETED,
      'Comment has been deleted',
    );
  }
}

/**
 * 댓글이 이미 삭제되었는지 검증합니다 (삭제 시도 시)
 */
export function validateCommentNotAlreadyDeleted(comment: Comment): void {
  if (comment.deletedAt) {
    throw new CustomError(
      ERROR_CODES.COMMENT_ALREADY_DELETED,
      'Comment has already been deleted',
    );
  }
}
