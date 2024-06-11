import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

export class CreateInventoryDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ type: UUID })
  productId: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @ApiProperty({ minimum: 1 })
  quantity: number;
}
