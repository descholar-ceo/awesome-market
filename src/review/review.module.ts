import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ProductModule } from '@/product/product.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), ProductModule, UserModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
