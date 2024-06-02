import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsOptional()
  @IsString()
  comment: string;
}
