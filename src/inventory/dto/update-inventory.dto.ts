import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
