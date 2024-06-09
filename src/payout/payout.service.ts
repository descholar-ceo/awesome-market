import { Injectable } from '@nestjs/common';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';

@Injectable()
export class PayoutService {
  create(createPayoutDto: CreatePayoutDto) {
    return 'This action adds a new payout';
  }

  findAll() {
    return `This action returns all payout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payout`;
  }

  update(id: number, updatePayoutDto: UpdatePayoutDto) {
    return `This action updates a #${id} payout`;
  }

  remove(id: number) {
    return `This action removes a #${id} payout`;
  }
}
