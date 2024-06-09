import { PartialType } from '@nestjs/swagger';
import { CreatePayoutDto } from './create-payout.dto';

export class UpdatePayoutDto extends PartialType(CreatePayoutDto) {}
