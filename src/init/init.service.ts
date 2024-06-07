import { PRODUCTION } from '@/common/constants.common';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { ConfigService } from '@/config/config.service';
import {
  ADMIN_ROLE,
  BUYER_ROLE,
  INITIAL_ADMIN_EMAIL,
  INITIAL_ADMIN_FNAME,
  INITIAL_ADMIN_LNAME,
  INITIAL_ADMIN_PASSWORD,
  INITIAL_ADMIN_PHONE,
  NODE_ENV,
  SELLER_ROLE,
} from '@/config/config.utils';
import { RoleResponseDto } from '@/role/dto/find-role.dto';
import { Role } from '@/role/entities/role.entity';
import { RoleService } from '@/role/role.service';
import { UserResponseDto } from '@/user/dto/find-user.dto';
import { UserService } from '@/user/user.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InitService {
  constructor(
    private readonly config: ConfigService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

  private async createOrFindRole(name: string): Promise<RoleResponseDto> {
    const { data: role } = (await this.roleService.findOneByName(name)) ?? {};
    if (!role) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.debug(`Initial ${name} role does not exist, creating it...`);
      }
      return this.roleService.create({ name });
    } else {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.debug(
          `Initial ${name} role already exists, skipping its initialization...`,
        );
      }
      return { status: statusCodes.OK, message: statusMessages.OK, data: role };
    }
  }

  private async createOrFindUser(
    email: string,
    roles: Role[],
  ): Promise<UserResponseDto> {
    const user = (await this.userService.findOneByEmail(email))?.data;
    if (!user) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.debug(`The initial ${email} does not exist, creating it...`);
      }
      return this.userService.create({
        email,
        firstName: this.config.get<string>(INITIAL_ADMIN_FNAME),
        lastName: this.config.get<string>(INITIAL_ADMIN_LNAME),
        phoneNumber: this.config.get<string>(INITIAL_ADMIN_PHONE),
        password: this.config.get<string>(INITIAL_ADMIN_PASSWORD),
        roles,
      });
    } else {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.debug(
          `Initial ${email} user already exists, skipping its initialization...`,
        );
      }
      return { status: statusCodes.OK, message: statusMessages.OK, data: user };
    }
  }

  async createInitialDatabaseDataNeededToWork(): Promise<void> {
    const adminRoleName = this.config.get<string>(ADMIN_ROLE);
    const buyerRoleName = this.config.get<string>(BUYER_ROLE);
    const sellerRoleName = this.config.get<string>(SELLER_ROLE);
    const adminUserEmail = this.config.get<string>(INITIAL_ADMIN_EMAIL);
    const adminRole = (await this.createOrFindRole(adminRoleName))?.data;
    await this.createOrFindRole(buyerRoleName);
    await this.createOrFindRole(sellerRoleName);
    await this.createOrFindUser(adminUserEmail, [adminRole]);
  }
}
