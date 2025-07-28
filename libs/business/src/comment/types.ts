import { Prisma, Comment } from '@prisma-client';

export type FindsByPostIdParams = {
  postId: number;
  cursor?: number;
  take?: number;
  includeDeleted?: boolean;
  sortOrder?: 'asc' | 'desc';
};

export type CreateParams = {
  content: string;
  postId: number;
  authorId: string;
};

export type UpdateParams = {
  id: number;
  content?: string;
};

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        nickName: true;
      };
    };
  };
}>;

export type FindsByPostIdResponse = {
  comments: CommentWithAuthor[];
  totalCount: number;
  nextCursor: number | null;
};

export type FindResponse = CommentWithAuthor;

export type CreateResponse = CommentWithAuthor;

export type UpdateResponse = CommentWithAuthor;

export type DeleteResponse = Comment;
