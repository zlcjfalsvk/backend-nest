export class PostResponseDto {
  id: number = 0;
  slug: string = '';
  title: string = '';
  content: string = '';
  published: boolean = false;
  views: number = 0;
  authorId: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt: Date | null = null;
  author?: {
    id: string;
    nickName: string;
  };
}

export class PostsResponseDto {
  posts: PostResponseDto[] = [];
  totalCount: number = 0;
  totalPages: number = 0;
  nextCursor: number | null = null;
}
