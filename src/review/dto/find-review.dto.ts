import { PaginationDto } from '@/common/common.dtos';
import { Review } from '../entities/review.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewsDataDto {
  @ApiProperty({ type: [Review] })
  reviews: Review[];
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
export class ReviewsResponseDto {
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ required: false, type: ReviewsDataDto })
  data?: ReviewsDataDto;
}
export class ReviewResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: Review, required: false })
  data?: Review;
}
