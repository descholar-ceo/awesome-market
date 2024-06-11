import {
  CommonErrorResponseDto,
  CommonResponseDto,
} from '@/common/common.dtos';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import { ADMIN_ROLE_NAME, SELLER_ROLE_NAME } from '@/role/role.constants';
import { User } from '@/user/entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/find-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';

@ApiTags('reviews')
@UseGuards(AuthGuard, RolesGuard)
@Controller('reviews')
@ApiBearerAuth('Authorization')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new review',
    description:
      'It uses createReviewDto passed as request body to create a review',
  })
  @ApiResponse({
    status: statusCodes.CREATED,
    description: 'Created review details',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() currUser: User,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.create(createReviewDto, currUser);
  }

  @Patch('/:id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Update a review',
    description:
      'It uses id passed as a param and updateReviewData passed as request body to update a review',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Updated review details',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateReviewData: UpdateReviewDto,
    @CurrentUser() currUser: User,
  ) {
    return this.reviewService.update(id, updateReviewData, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Delete(':id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Deletes a review',
    description: 'It uses id passed as a param to delete a review',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Deleted review details',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currUser: User,
  ): Promise<CommonResponseDto> {
    return this.reviewService.remove(id, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateIdFromParam())
  @ApiOperation({
    summary: 'Fetches a review',
    description: 'It uses id passed as a param to fetch a review',
  })
  @ApiResponse({
    status: statusCodes.OK,
    description: 'Fetched review details',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: statusCodes.BAD_REQUEST,
    description: statusMessages.BAD_REQUEST,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.UNAUTHORIZED,
    description: statusMessages.UNAUTHORIZED,
    type: CommonErrorResponseDto,
  })
  @ApiResponse({
    status: statusCodes.FORBIDDEN,
    description: statusMessages.FORBIDDEN,
    type: CommonErrorResponseDto,
  })
  findById(@Param('id') id: string) {
    return this.reviewService.findById(id);
  }
}
