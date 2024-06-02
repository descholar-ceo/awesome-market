import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Max,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Max(5)
  rating: number;
  @IsNotEmpty()
  @IsString()
  comment: string;
}
