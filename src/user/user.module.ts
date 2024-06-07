import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleModule } from '@/role/role.module';
import { MailModule } from '@/mail/mail.module';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule, MailModule],
  controllers: [UserController, AuthController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
