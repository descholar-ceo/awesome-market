import {
  CustomForbiddenException,
  CustomNotFoundException,
} from '@/common/exception/custom.exception';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { ProductService } from '@/product/product.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { isUserAdmin } from '@/user/user.utils';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/find-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}
  async create(
    createReviewData: CreateReviewDto,
    currUser: User,
  ): Promise<ReviewResponseDto> {
    const { productId } = createReviewData;
    const { data: product } =
      (await this.productService.findById(productId)) ?? {};
    const review = await this.reviewRepository.create(createReviewData);
    review.product = product;
    review.ratedBy = (await this.userService.findOneById(currUser.id))?.data;
    review.updatedBy = currUser;

    const savedReview = await this.reviewRepository.save(review);
    return {
      status: statusCodes.CREATED,
      message: statusMessages.CREATED,
      data: plainToInstance(Review, savedReview, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findById(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['ratedBy', 'updatedBy', 'product'],
    });
    if (!review) {
      throw new CustomNotFoundException({ messages: ['Review Not Found'] });
    }

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: plainToInstance(Review, review, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async update(
    id: string,
    updateReviewData: UpdateReviewDto,
    currUser: User,
  ): Promise<ReviewResponseDto> {
    const { data: review } = (await this.findById(id)) ?? {};

    if (!isUserAdmin(currUser) && review.ratedBy.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot update a review that you do not own',
      );
    }
    review.updatedBy = currUser;
    review.ratedBy = currUser;
    Object.assign(review, updateReviewData);
    const data = await this.reviewRepository.save(review);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data,
    };
  }

  async remove(id: string, currUser: User): Promise<ReviewResponseDto> {
    const { data: review } = (await this.findById(id)) ?? {};

    if (!isUserAdmin(currUser) && review.ratedBy.id !== currUser.id) {
      throw new CustomForbiddenException({
        messages: ['You cannot delete a review that you do not own'],
      });
    }
    await this.reviewRepository.delete(id);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: review,
    };
  }
}
