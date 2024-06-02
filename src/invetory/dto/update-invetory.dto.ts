import { PartialType } from '@nestjs/swagger';
import { CreateInvetoryDto } from './create-invetory.dto';

export class UpdateInvetoryDto extends PartialType(CreateInvetoryDto) {}
