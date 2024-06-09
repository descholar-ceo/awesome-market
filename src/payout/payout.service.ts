import { Injectable } from '@nestjs/common';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Injectable()
export class PayoutService {
  create(createPayoutDto: CreatePayoutDto) {
    return 'This action adds a new payout';
  }
}
