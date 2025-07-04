import { Prisma, Post } from '@prisma-client';

export type FindsParams = {
  cursor?: number;
  take?: number;
  includeDeleted?: boolean;
  onlyPublished?: boolean;
  sortBy?: 'views' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type CreateParams = {
  title: string;
  content: string;
  slug: string;
  published?: boolean;
  authorId: string;
};

export type UpdateParams = {
  id: number;
  title?: string;
  content?: string;
  slug?: string;
  published?: boolean;
};

// Return types for PostService methods

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        nickName: true;
      };
    };
  };
}>;

export type PostListItem = Pick<
  Post,
  'id' | 'title' | 'slug' | 'views' | 'createdAt'
> & {
  author: {
    nickName: string;
  };
};

export type FindsResponse = {
  posts: PostListItem[];
  totalCount: number;
  totalPages: number;
  nextCursor: number | null;
};

export type FindResponse = PostWithAuthor & {
  views: number;
};

export type CreateResponse = PostWithAuthor;

export type UpdateResponse = PostWithAuthor;

export type DeleteResponse = Post;
