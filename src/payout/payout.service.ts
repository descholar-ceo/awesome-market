import { Injectable, Logger } from '@nestjs/common';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { QueryRunner, Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomBadRequest } from '@/common/exception/custom.exception';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import { PRODUCTION } from '@/common/constants.common';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly config: ConfigService,
  ) {}
  async create(
    createPayoutData: CreatePayoutDto,
    queryRunner?: QueryRunner,
  ): Promise<Payout | null> {
    const { seller, order, amount } = createPayoutData;
    let createdPayout: Payout = this.payoutRepository.create({
      seller,
      order,
      amount,
    });
    try {
      if (createPayoutData?.order?.id && createPayoutData?.seller?.id) {
        if (!!queryRunner) {
          createdPayout = await queryRunner.manager.save(createdPayout);
        } else {
          createdPayout = await this.payoutRepository.save(createdPayout);
        }
        return createdPayout;
      } else {
        throw new CustomBadRequest({
          messages: ['Order Id missing or Seller Id missing'],
        });
      }
    } catch (err) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      return null;
    }
  }
}
