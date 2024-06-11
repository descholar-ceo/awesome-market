import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
  @IsString()
  @IsOptional()
  @ApiProperty()
  description: string;
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  categoryId: string;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  unitPrice: number;
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  thumbnail: string;
}
