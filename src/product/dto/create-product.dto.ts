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
  name: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;
  @IsUrl()
  @IsNotEmpty()
  thumbnail: string;
}
