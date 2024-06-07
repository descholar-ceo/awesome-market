import { CommonResponseDto } from '@/common/common.dtos';
import { PRODUCTION } from '@/common/constants.common';
import { CustomInternalServerErrorException } from '@/common/exception/custom.exception';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { decodeToken, generateTokens } from '@/common/utils/token.utils';
import { ConfigService } from '@/config/config.service';
import {
  API_URL,
  APP_MAILING_ADDRESS,
  INITIAL_ADMIN_EMAIL,
  NODE_ENV,
} from '@/config/config.utils';
import { MailService } from '@/mail/mail.service';
import { RoleService } from '@/role/role.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import {
  DataSource,
  DeleteResult,
  FindOneOptions,
  QueryRunner,
  Repository,
} from 'typeorm';
import { BUYER_ROLE_NAME, SELLER_ROLE_NAME } from './../role/role.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/find-user.dto';
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
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createUserData: CreateUserDto,
    userType?: string,
  ): Promise<UserResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let newUserRole = BUYER_ROLE_NAME;
      let newUserData = { ...createUserData, isActive: true };
      if (userType === SELLER_ROLE_NAME) {
        newUserRole = SELLER_ROLE_NAME;
        newUserData = { ...newUserData, isActive: false };
      }
      const newUser = this.userRepository.create(newUserData);
      if (!createUserData?.roles?.length) {
        let defaultRole = (await this.roleService.findOneByName(newUserRole))
          ?.data;
        if (!defaultRole) {
          defaultRole = (
            await this.roleService.create(
              {
                name: newUserRole,
              },
              queryRunner,
            )
          )?.data;
        }
        newUser.roles = [defaultRole];
      }
      const savedUser = await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();
      let responseMessage: string = `${statusMessages.CREATED}: You can now login`;
      if (
        !!savedUser?.roles
          ?.map((currRole) => currRole.name)
          ?.includes(SELLER_ROLE_NAME)
      ) {
        await this.sendSellerAccountApprovalEmailToAdmin(savedUser);
        responseMessage =
          'Your account has been successfully created and is currently under review. We appreciate your patience and will get back to you shortly. Thank you!';
      }
      return {
        status: statusCodes.CREATED,
        message: responseMessage,
        data: plainToInstance(User, savedUser, {
          excludeExtraneousValues: true,
        }),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      throw new CustomInternalServerErrorException({
        messages: [
          'Something wrong happened while creating your account, try again',
        ],
      });
    } finally {
      await queryRunner.release();
    }
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
      const { accessToken, refreshToken } = await generateTokens(user);
      return {
        status: statusCodes.OK,
        message: statusMessages.OK,
        data: { accessToken, refreshToken },
      };
    }
    return {
      status: statusCodes.UNAUTHORIZED,
      message: statusMessages.UNAUTHORIZED,
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
      const { accessToken } = await generateTokens(user);
      return {
        status: statusCodes.OK,
        message: statusMessages.OK,
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
    const sellerUser = (await this.findOneBy({ where: { id: sellerId } }))
      ?.data;
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
          message: statusMessages.OK,
        };
      } catch (err) {
        if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
          Logger.error(err);
        }
      }
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: statusMessages.INTERNAL_SERVER_ERROR,
    };
  }

  async findOneById(
    id: string,
    queryRunner?: QueryRunner,
  ): Promise<UserResponseDto> {
    return await this.findOneBy(
      { where: { id }, relations: ['inventories', 'orders'] },
      queryRunner,
    );
  }

  async findOneByEmail(
    email: string,
    queryRunner?: QueryRunner,
  ): Promise<UserResponseDto> {
    return await this.findOneBy({ where: { email } }, queryRunner);
  }

  async findOneByPhoneNumber(
    phoneNumber: string,
    queryRunner?: QueryRunner,
  ): Promise<UserResponseDto> {
    return await this.findOneBy({ where: { phoneNumber } }, queryRunner);
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
      return { status: statusCodes.OK, message: statusMessages.OK };
    }
    return {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong, try again',
    };
  }

  private async sendSellerAccountApprovalEmailToAdmin(
    savedUser: User,
  ): Promise<void> {
    const adminUser = (
      await this.findOneBy({
        where: { email: this.config.get<string>(INITIAL_ADMIN_EMAIL) },
      })
    )?.data;
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
          emailSubject: 'Account Approval Request for New Seller Registration',
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
        throw new CustomInternalServerErrorException({
          messages: [
            err?.message ??
              'Something unexpected happened when tryin to send approval Email to admin!',
          ],
        });
      }
    }
  }
  private async findOneBy(
    whereCondition: FindOneOptions<User>,
    queryRunner?: QueryRunner,
  ): Promise<UserResponseDto> {
    let user: User;
    if (!!queryRunner) {
      user = await queryRunner.manager.findOne(User, whereCondition);
    } else {
      user = await this.userRepository.findOne(whereCondition);
    }
    if (!user) {
      return {
        status: statusCodes.NOT_FOUND,
        message: statusMessages.NOT_FOUND,
      };
    }
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: plainToInstance(User, user, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
