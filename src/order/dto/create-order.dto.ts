import { IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  inventoryId: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
