import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @ApiProperty({ minimum: 1 })
  quantity: number;
}
