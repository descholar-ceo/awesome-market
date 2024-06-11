import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  productId: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Max(5)
  @ApiProperty({ maximum: 5 })
  rating: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  comment: string;
}
