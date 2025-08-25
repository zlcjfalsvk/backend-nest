export class CommentResponseDto {
  id: number;
  content: string;
  postId: number;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author?: {
    id: string;
    nickName: string;
  };
}

export class CommentsResponseDto {
  comments: CommentResponseDto[];
  totalCount: number;
  nextCursor: number | null;
}
