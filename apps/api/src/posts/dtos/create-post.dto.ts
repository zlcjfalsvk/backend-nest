import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsString()
  authorId: string;
}
