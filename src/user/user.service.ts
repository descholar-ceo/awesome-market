import { CommonResponseDto } from '@/common/common.dtos';
import { PRODUCTION } from '@/common/constants.common';
import {
  CustomInternalServerErrorException,
  CustomUnauthorizedException,
} from '@/common/exception/custom.exception';
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
import { AuthTokenDataDto, LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  prepareAccountApprovalEmailBody,
  prepareAccountApprovedMessageBody,
  prepareAccountPendingNotifyBody,
} from './user.utils';
import { Role } from '@/role/entities/role.entity';

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
      const { newUserRole, newUserData } = this.determineUserRoleAndData(
        createUserData,
        userType,
      );
      const newUser = this.userRepository.create(newUserData);

      if (!createUserData?.roles?.length) {
        newUser.roles = [await this.getDefaultRole(newUserRole, queryRunner)];
      }

      const savedUser = await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();

      const responseMessage = this.getResponseMessage(savedUser);
      if (this.isSeller(savedUser)) {
        await this.sendSellerAccountApprovalEmailToAdmin(savedUser);
      }

      return this.buildUserResponse(savedUser, responseMessage);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logError(err);
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
    const { data: user } = (await this.findOneByEmail(email)) ?? {};
    if (!user || !user?.isActive) this.throwUnauthorizedError();
    if (bcrypt.compareSync(password, user.password)) {
      const { accessToken, refreshToken } = await generateTokens(user);
      return await this.buildTokenResponse({ accessToken, refreshToken });
    }
    this.throwUnauthorizedError();
  }

  async refreshAccessToken(refreshToken: string): Promise<LoginResponseDto> {
    if (!refreshToken) this.throwUnauthorizedError();
    try {
      const { id } = (await decodeToken(refreshToken)) ?? {};
      const { data: user } = (await this.findOneById(id)) ?? {};
      if (!user) this.throwUnauthorizedError();
      const { accessToken } = await generateTokens(user);
      return await this.buildTokenResponse({ accessToken });
    } catch (err) {
      this.logError(err);
      this.throwUnauthorizedError();
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
      { where: { id }, relations: ['inventories', 'orders', 'roles'] },
      queryRunner,
    );
  }

  async findOneByEmail(
    email: string,
    queryRunner?: QueryRunner,
  ): Promise<UserResponseDto> {
    return await this.findOneBy(
      { where: { email }, relations: ['roles'] },
      queryRunner,
    );
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

  private throwUnauthorizedError(): void {
    throw new CustomUnauthorizedException({
      messages: [`${statusCodes.UNAUTHORIZED}: Invalid Credentials`],
    });
  }
  private determineUserRoleAndData(
    createUserData: CreateUserDto,
    userType?: string,
  ): { newUserRole: string; newUserData: CreateUserDto } {
    const newUserRole =
      userType === SELLER_ROLE_NAME ? SELLER_ROLE_NAME : BUYER_ROLE_NAME;
    const newUserData = {
      ...createUserData,
      isActive: userType !== SELLER_ROLE_NAME,
    };
    return { newUserRole, newUserData };
  }

  private async getDefaultRole(
    roleName: string,
    queryRunner: QueryRunner,
  ): Promise<Role> {
    let { data: role } = (await this.roleService.findOneByName(roleName)) ?? {};
    if (!role) {
      role = (await this.roleService.create({ name: roleName }, queryRunner))
        ?.data;
    }
    return role;
  }

  private getResponseMessage(user: User): string {
    return this.isSeller(user)
      ? 'Your account has been successfully created and is currently under review. We appreciate your patience and will get back to you shortly. Thank you!'
      : `${statusMessages.CREATED}: You can now login`;
  }

  private isSeller(user: User): boolean {
    return !!user?.roles?.some((role) => role.name === SELLER_ROLE_NAME);
  }

  private buildUserResponse(user: User, message: string): UserResponseDto {
    return {
      status: statusCodes.CREATED,
      message,
      data: plainToInstance(User, user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  private async buildTokenResponse(
    token: AuthTokenDataDto,
  ): Promise<LoginResponseDto> {
    return {
      status: statusCodes.CREATED,
      message: statusMessages.CREATED,
      data: token,
    };
  }

  private logError(error: any): void {
    if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
      Logger.error(error);
    }
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
              'Something unexpected happened when trying to send approval Email to admin!',
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
