import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  inventoryId: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @ApiProperty({ minimum: 1 })
  quantity: number;
}
