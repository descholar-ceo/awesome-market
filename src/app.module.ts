import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PRODUCTION } from 'src/common/constants.common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import {
  ConfigService,
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
  NODE_ENV,
} from './config/config.service';
import { UserModule } from './user/user.module';
import { CustomNamingStrategy } from './config/naming-strategies';
import { ProductModule } from './product/product.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(DB_HOST),
        port: configService.get<number>(DB_PORT),
        username: configService.get<string>(DB_USERNAME),
        password: configService.get<string>(DB_PASSWORD),
        database: configService.get<string>(DB_DATABASE),
        synchronize: configService.get(NODE_ENV) === PRODUCTION ? false : true,
        retryAttempts: 15,
        retryDelay: 30000,
        autoLoadEntities: true,
        namingStrategy: new CustomNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ProductModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
