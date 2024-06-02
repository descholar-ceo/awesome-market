import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(5)
  rating: number;
  @IsOptional()
  @IsString()
  comment: string;
}
