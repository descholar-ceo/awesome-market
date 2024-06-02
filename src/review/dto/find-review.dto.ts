import { PaginationDto } from '@/common/common.dtos';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Review } from '../entities/review.entity';

export class FindReviewFiltersDto {
  @IsOptional()
  @IsDateString()
  createdFromDate?: Date;
  @IsOptional()
  @IsDateString()
  createdToDate?: Date;
  @IsOptional()
  @IsUUID()
  ratedById?: string;
  @IsOptional()
  @IsUUID()
  productId?: string;
  @IsOptional()
  @IsString()
  comment?: string;
  @IsOptional()
  pageNumber?: number = 1;
  @IsOptional()
  recordsPerPage?: number = 10;
  @IsOptional()
  minRating?: number;
  @IsOptional()
  maxRating?: number;
  @IsOptional()
  @IsIn(['rating', 'createdAt', 'id', 'updatedAt'])
  sortBy?: string;
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
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
