import { PaginationDto } from '@/common/common.dtos';
import { Review } from '../entities/review.entity';

export class ReviewsDataDto {
  reviews: Review[];
  pagination: PaginationDto;
}
export class ReviewsResponseDto {
  status: number;
  message: string;
  data?: ReviewsDataDto;
}
export class ReviewResponseDto {
  status: number;
  message: string;
  data?: Review;
}
