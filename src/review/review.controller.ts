import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from '@/decorators/roles/roles.decorator';
import { ValidateUuidPipe } from '@/pipes/validate-uuid/validate-uuid';
import { ADMIN_ROLE_NAME, SELLER_ROLE_NAME } from '@/role/role.constants';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { CurrentUser } from '@/decorators/current-user/current-user.decorator';
import { User } from '@/user/entities/user.entity';
import { ReviewResponseDto } from './dto/find-review.dto';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import { CommonResponseDto } from '@/common/common.dtos';

@UseGuards(AuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() currUser: User,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.create(createReviewDto, currUser);
  }

  @Patch('/:id')
  @UsePipes(new ValidateIdFromParam())
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() currUser: User,
  ) {
    return this.reviewService.update(id, updateReviewDto, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Delete(':id')
  @UsePipes(new ValidateIdFromParam())
  async remove(
    @Param('id') id: string,
    @CurrentUser() currUser: User,
  ): Promise<CommonResponseDto> {
    return this.reviewService.remove(id, currUser);
  }

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Get(':id')
  @UsePipes(new ValidateUuidPipe())
  findById(@Param('id') id: string) {
    return this.reviewService.findById(id);
  }
}
