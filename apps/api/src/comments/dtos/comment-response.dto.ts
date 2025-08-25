class AuthorInCommentResponseDto {
  id: string = '';
  nickName: string = '';
}

export class CommentResponseDto {
  id: number = 0;
  content: string = '';
  postId: number = 0;
  authorId: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt: Date | null = null;
  author: AuthorInCommentResponseDto = new AuthorInCommentResponseDto();
}

export class CommentsResponseDto {
  comments: CommentResponseDto[] = [];
  totalCount: number = 0;
  nextCursor: number | null = null;
}
