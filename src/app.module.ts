import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import typeorm from './config/typeorm/typeorm.config';
import { InitModule } from './init/init.module';
import { InitialAdminProvider } from './init/init.provider';
import { InventoryModule } from './inventory/inventory.module';
import { MailModule } from './mail/mail.module';
import { OrderItemModule } from './order-item/order-item.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { RoleModule } from './role/role.module';
import { StripeModule } from './stripe/stripe.module';
import { UserModule } from './user/user.module';
import { PayoutModule } from './payout/payout.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    UserModule,
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [NestConfigService],
      useFactory: async (configService: NestConfigService) =>
        configService.get('typeorm'),
    }),
    ProductModule,
    RoleModule,
    InitModule,
    MailModule,
    CategoryModule,
    InventoryModule,
    ReviewModule,
    OrderModule,
    OrderItemModule,
    StripeModule,
    PayoutModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, InitialAdminProvider],
})
export class AppModule {}
