import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import typeorm from './config/typeorm/typeorm.config';
import { InitModule } from './init/init.module';
import { InitialAdminProvider } from './init/init.provider';
import { ProductModule } from './product/product.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [NestConfigService],
      useFactory: async (configService: NestConfigService) =>
        configService.get('typeorm'),
    }),
    UserModule,
    ProductModule,
    RoleModule,
    InitModule,
    MailModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, InitialAdminProvider],
})
export class AppModule {}
