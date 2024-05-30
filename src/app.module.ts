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
import { ProductModule } from './product/product.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { InitModule } from './init/init.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
