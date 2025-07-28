import { IsString, IsNumber, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsNumber()
  postId: number;

  @IsString()
  authorId: string;
}
