export class PostResponseDto {
  id: number;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  views: number;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author?: {
    id: string;
    nickName: string;
  };
}

export class PostsResponseDto {
  posts: PostResponseDto[];
  totalCount: number;
  totalPages: number;
  nextCursor: number | null;
}
