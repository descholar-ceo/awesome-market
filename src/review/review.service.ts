import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { ReviewResponseDto } from './dto/find-review.dto';
import { ProductService } from '@/product/product.service';
import { UserService } from '@/user/user.service';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { plainToInstance } from 'class-transformer';
import { isUserAdmin } from '@/user/user.utils';
import { CommonResponseDto } from '@/common/common.dtos';

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
    const product = (await this.productService.findById(productId))?.data;
    if (!product) throw new NotFoundException('Product not found');
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
      throw new NotFoundException(`Review with ID ${id} not found`);
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
    const review = (await this.findById(id))?.data;
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (!isUserAdmin(currUser) && review.ratedBy.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot update a review that you do not own',
      );
    }
    review.updatedBy = currUser;
    review.ratedBy = currUser;
    Object.assign(review, updateReviewData);
    const { affected } = await this.reviewRepository.update(id, review);
    if (!!affected) {
      return await this.findById(id);
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: 'Nothing updated',
    };
  }

  async remove(id: string, currUser: User): Promise<CommonResponseDto> {
    const review = await this.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (!isUserAdmin(currUser) && review.data.ratedBy.id !== currUser.id) {
      throw new ForbiddenException(
        'You cannot delete a review that you do not own',
      );
    }
    const { affected } = await this.reviewRepository.delete(id);
    if (!!affected) {
      return { status: statusCodes.OK, message: statusMessages.OK };
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong, try again',
    };
  }
}
