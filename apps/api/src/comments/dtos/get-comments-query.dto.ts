import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class GetCommentsQueryDto {
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
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
