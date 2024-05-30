import { Module } from '@nestjs/common';
import { InitService } from './init.service';
import { ConfigModule } from '@/config/config.module';
import { RoleModule } from '@/role/role.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [ConfigModule, RoleModule, UserModule],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
