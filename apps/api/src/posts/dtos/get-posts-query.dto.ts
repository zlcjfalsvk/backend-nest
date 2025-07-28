import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class GetPostsQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  cursor?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  @Max(100)
  take?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeDeleted?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyPublished?: boolean;

  @IsOptional()
  @IsIn(['views', 'createdAt'])
  sortBy?: 'views' | 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
