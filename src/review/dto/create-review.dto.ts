import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  rating: number;
  @IsNotEmpty()
  @IsString()
  comment: string;
}
