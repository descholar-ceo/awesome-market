import { CommonResponseDto } from '@/common/common.dtos';
import { PRODUCTION } from '@/common/constants.common';
import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { decodeToken, encodeToken } from '@/common/utils/token.utils';
import { ConfigService } from '@/config/config.service';
import {
  ACCESS_JWT_EXPIRES,
  API_URL,
  APP_MAILING_ADDRESS,
  BUYER_ROLE,
  INITIAL_ADMIN_EMAIL,
  NODE_ENV,
  REFRESH_JWT_EXPIRES,
  SELLER_ROLE,
} from '@/config/config.utils';
import { MailService } from '@/mail/mail.service';
import { RoleService } from '@/role/role.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { DeleteResult, QueryRunner, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/find-product.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  prepareAccountApprovalEmailBody,
  prepareAccountApprovedMessageBody,
  prepareAccountPendingNotifyBody,
} from './user.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async create(
    createUserData: CreateUserDto,
    userType?: string,
  ): Promise<User> {
    let newUserRole = this.config.get<string>(BUYER_ROLE);
    const sellerRoleName = this.config.get<string>(SELLER_ROLE);
    let newUserData = { ...createUserData, isActive: true };
    if (userType === sellerRoleName) {
      newUserRole = sellerRoleName;
      newUserData = { ...newUserData, isActive: false };
    }
    const newUser = this.userRepository.create(newUserData);
    let defaultRole = (
      await this.roleService.find({
        name: newUserRole,
      })
    )?.[0];
    if (!defaultRole) {
      defaultRole = await this.roleService.create({
        name: newUserRole,
      });
    }
    if (!createUserData?.roles?.length) {
      newUser.roles = [defaultRole];
    }
    const savedUser = await this.userRepository.save(newUser);
    if (
      !!savedUser?.roles
        ?.map((currRole) => currRole.name)
        ?.includes(sellerRoleName)
    ) {
      const adminUser = (
        await this.find({ email: this.config.get<string>(INITIAL_ADMIN_EMAIL) })
      )?.[0];
      if (!!adminUser?.email) {
        try {
          const approvalUrl = `${this.config.get<string>(API_URL)}/users/approve-seller-account?seller-id=${savedUser.id}`;
          const { html, text } = prepareAccountApprovalEmailBody({
            approvalUrl,
            admin: adminUser,
            seller: savedUser,
          });
          await this.mailService.sendEmail({
            fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
            emailHtmlBody: html,
            emailTextBody: text,
            emailSubject:
              'Account Approval Request for New Seller Registration',
            personalizations: [{ to: { email: adminUser.email } }],
          });
          const { html: pendingHtml, text: pendingText } =
            prepareAccountPendingNotifyBody({
              approvalUrl,
              admin: adminUser,
              seller: savedUser,
            });
          await this.mailService.sendEmail({
            fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
            emailHtmlBody: pendingHtml,
            emailTextBody: pendingText,
            emailSubject:
              'Pending Verification and Approval of Your Seller Account',
            personalizations: [{ to: { email: savedUser.email } }],
          });
        } catch (err) {
          if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
            Logger.error(err);
          }
        }
      }
    }
    return plainToInstance(User, savedUser, { excludeExtraneousValues: true });
  }

  async login(loginData: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginData;
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!user || !user?.isActive) {
      return {
        status: statusCodes.UNAUTHORIZED,
        message: 'Email or Password Wrong',
      };
    }
    if (bcrypt.compareSync(password, user.password)) {
      const { accessToken, refreshToken } = await this.generateTokens(user);
      return {
        status: statusCodes.OK,
        message: statusNames.OK,
        data: { accessToken, refreshToken },
      };
    }
    return {
      status: statusCodes.UNAUTHORIZED,
      message: statusNames.UNAUTHORIZED,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<LoginResponseDto> {
    if (!refreshToken) {
      return {
        status: statusCodes.BAD_REQUEST,
        message: 'Pass authorization that should be the refresh token',
      };
    }
    try {
      const { id } = (await decodeToken(refreshToken)) ?? {};
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      });
      if (!user) {
        return {
          status: statusCodes.UNAUTHORIZED,
          message: 'Refresh token invalid',
        };
      }
      const { accessToken } = await this.generateTokens(user);
      return {
        status: statusCodes.OK,
        message: statusNames.OK,
        data: { accessToken },
      };
    } catch (err) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      return {
        status: statusCodes.UNAUTHORIZED,
        message: 'Refresh token invalid',
      };
    }
  }

  async approveSellerAccount(sellerId: string): Promise<CommonResponseDto> {
    if (!sellerId) {
      return {
        status: statusCodes.BAD_REQUEST,
        message: 'Seller Id is required',
      };
    }
    const sellerUser = (await this.find({ id: sellerId }))?.[0];
    if (!sellerUser) {
      return {
        status: statusCodes.NOT_FOUND,
        message: 'Seller Not Found',
      };
    }
    if (sellerUser.isActive) {
      return {
        status: statusCodes.CONFLICT,
        message: 'Seller is already active',
      };
    }
    const updatedSeller = await this.update(sellerId, { isActive: true });
    if (!!updatedSeller?.isActive) {
      try {
        const { html, text } = prepareAccountApprovedMessageBody({
          approvalUrl: null,
          admin: null,
          seller: updatedSeller,
        });
        await this.mailService.sendEmail({
          fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
          emailHtmlBody: html,
          emailTextBody: text,
          emailSubject: 'Your Seller Account Has Been Approved!',
          personalizations: [{ to: { email: updatedSeller.email } }],
        });
        return {
          status: statusCodes.OK,
          message: statusNames.OK,
        };
      } catch (err) {
        if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
          Logger.error(err);
        }
      }
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: statusNames.INTERNAL_SERVER_ERROR,
    };
  }

  async findById(
    id: string,
    queryRunner?: QueryRunner,
  ): Promise<UserResponseDto> {
    const findCondition = {
      where: { id },
      relations: ['inventories', 'orders'],
    };
    let user: User;
    if (!!queryRunner) {
      user = await queryRunner.manager.findOne(User, findCondition);
    } else {
      user = await this.userRepository.findOne(findCondition);
    }
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      status: statusCodes.OK,
      message: statusNames.OK,
      data: plainToInstance(User, user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async find(where: Record<string, any>) {
    return await this.userRepository.find({ where });
  }

  async findOne(id: string) {
    return await this.userRepository.findBy({ id });
  }

  async update(id: string, updateUserData: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    Object.assign(user, updateUserData);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<CommonResponseDto> {
    const { affected }: DeleteResult = await this.userRepository.delete(id);
    if (!!affected) {
      return { status: statusCodes.OK, message: statusNames.OK };
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong, try again',
    };
  }

  private async generateTokens(user: User): Promise<{
    accessToken?: string;
    refreshToken?: string;
  }> {
    const { id, roles } = user;
    const accessTokenData = {
      id,
      roles: (roles ?? []).map((currRole) => currRole.name) ?? [],
    };
    const refreshTokenData = {
      id,
    };
    const accessToken = await encodeToken(
      accessTokenData,
      this.config.get<string>(ACCESS_JWT_EXPIRES),
    );
    const refreshToken = await encodeToken(
      refreshTokenData,
      this.config.get<string>(REFRESH_JWT_EXPIRES),
    );
    return { accessToken, refreshToken };
  }
}
