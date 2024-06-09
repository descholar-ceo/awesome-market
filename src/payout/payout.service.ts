import { CommonResponseDto } from '@/common/common.dtos';
import { PRODUCTION } from '@/common/constants.common';
import {
  CustomBadRequest,
  CustomNotFoundException,
} from '@/common/exception/custom.exception';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import { paymentStatuses } from '@/order/order.constants';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { FindPayoutFiltersDto, PayoutResponseDto } from './dto/find-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { Payout } from './entities/payout.entity';

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

  async findWithFilters(
    filters: FindPayoutFiltersDto,
  ): Promise<CommonResponseDto> {
    const { status } = filters;
    const findPayoutsQuery = this.buildFindPayoutsQuery(status);

    const totalRecords = await findPayoutsQuery.getCount();
    if (totalRecords === 0) {
      throw new CustomNotFoundException({ messages: ['No records found'] });
    }
    const payouts = await findPayoutsQuery
      .leftJoinAndSelect('payout.order', 'order')
      .leftJoinAndSelect('payout.seller', 'seller')
      .getMany();

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: {
        payouts: plainToInstance(Payout, payouts, {
          excludeExtraneousValues: true,
        }),
      },
    };
  }

  async update(
    id: string,
    updatePayoutData: UpdatePayoutDto,
  ): Promise<PayoutResponseDto> {
    const payout = await this.payoutRepository.findOneBy({ id });
    Object.assign(payout, { ...updatePayoutData });
    const data = await this.payoutRepository.save(payout);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data,
    };
  }

  private buildFindPayoutsQuery(
    status?: paymentStatuses,
  ): SelectQueryBuilder<Payout> {
    const query = this.payoutRepository.createQueryBuilder('payout');

    if (status) {
      query.andWhere('product.status = :status', { status });
    }

    return query;
  }
}
