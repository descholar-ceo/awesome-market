import { PRODUCTION } from '@/common/constants.common';
import {
  CustomBadRequest,
  CustomConflictException,
  CustomInternalServerErrorException,
  CustomNotFoundException,
  CustomUnauthorizedException,
} from '@/common/exception/custom.exception';
import { getDateInterval } from '@/common/utils/dates.utils';
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
import { Role } from '@/role/entities/role.entity';
import { RoleService } from '@/role/role.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import {
  DataSource,
  FindOneOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { BUYER_ROLE_NAME, SELLER_ROLE_NAME } from './../role/role.constants';
import { CreateUserDto } from './dto/create-user.dto';
import {
  FindUserFiltersDto,
  UserResponseDto,
  UsersResponseDto,
} from './dto/find-user.dto';
import { AuthTokenDataDto, LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  getNewStripeAccountOnboardingUrl,
  prepareAccountApprovalEmailBody,
  prepareAccountApprovedMessageBody,
  prepareAccountPendingNotifyBody,
  prepareLoginToStripeExpressAccountMessageBody,
} from './user.utils';
import { StripeService } from '@/stripe/stripe.service';
import { CommonResponseDto } from '@/common/common.dtos';

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

      return this.buildUserResponse(
        savedUser,
        statusCodes.CREATED,
        responseMessage,
      );
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
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!user || !user?.isActive) this.throwUnauthorizedError();
    try {
      if (bcrypt.compareSync(password, user.password)) {
        const { accessToken, refreshToken } = await generateTokens(user);
        return await this.buildTokenResponse({ accessToken, refreshToken });
      }
      this.throwUnauthorizedError();
    } catch (err) {
      this.logError(err);
      this.throwUnauthorizedError();
    }
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

  async approveSellerAccount(
    sellerId: string,
    stripeService: StripeService,
  ): Promise<UserResponseDto> {
    this.validateSellerId(sellerId);

    const sellerUser = await this.findAndValidateSeller(sellerId);
    this.ensureSellerIsNotActive(sellerUser);

    const stripeAccountId =
      await stripeService.createExpressAccount(sellerUser);

    const { data: updatedSeller } =
      (await this.update(sellerId, { isActive: true, stripeAccountId })) ?? {};
    const stripeAccountOnboardingUrl =
      await stripeService.createExpressAccountLink(updatedSeller);
    await this.sendApprovalEmail(updatedSeller, stripeAccountOnboardingUrl);

    return { status: statusCodes.OK, message: statusMessages.OK };
  }

  async generateNewStripeOnBoardingUrl(
    userId: string,
    stripeService: StripeService,
  ): Promise<CommonResponseDto> {
    const { data: user } = (await this.findOneById(userId)) ?? {};
    const stripeAccountOnboardingUrl =
      await stripeService.createExpressAccountLink(user);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: { stripeAccountOnboardingUrl },
    };
  }

  async generateStripeExpressLoginUrl(
    userId: string,
    stripeService: StripeService,
  ): Promise<CommonResponseDto> {
    const { data: user } = (await this.findOneById(userId)) ?? {};
    if (!user?.stripeAccountId) {
      throw new CustomBadRequest({
        messages: ['This user seems to not have an express connected account'],
      });
    }
    const stripeExpressAccountLoginUrl = await stripeService.createLoginLink(
      user.stripeAccountId,
    );
    if (!!stripeExpressAccountLoginUrl) {
      const { html, text } = prepareLoginToStripeExpressAccountMessageBody({
        seller: user,
        stripeExpressAccountLoginUrl,
      });
      await this.mailService.sendEmail({
        fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
        personalizations: [{ to: { email: user.email } }],
        emailHtmlBody: html,
        emailTextBody: text,
        emailSubject:
          'Access Your Stripe Express Account to Manage Payments and Withdraw Funds',
      });
    }
    return {
      status: statusCodes.OK,
      message: `${statusMessages.OK}: The login to your stripe express dashboard has been sent to your email, kindly check it out`,
    };
  }

  async findWithFilters(
    filters: FindUserFiltersDto,
  ): Promise<UsersResponseDto> {
    const {
      firstName,
      lastName,
      createdFromDate,
      createdToDate,
      phoneNumber,
      pageNumber,
      recordsPerPage,
      sortBy,
      sortOrder,
      email,
      shippingAddress,
    } = filters;
    let { isActive } = filters;
    if (!!isActive) {
      isActive = Boolean(isActive);
    }
    const { startDate, endDate } = getDateInterval(
      createdFromDate,
      createdToDate,
    );
    const findUsersQuery = this.buildFindUsersQuery(
      firstName,
      lastName,
      phoneNumber,
      email,
      shippingAddress,
      isActive,
      startDate,
      endDate,
      sortBy,
      sortOrder?.toUpperCase(),
    );

    const totalRecords = await findUsersQuery.getCount();
    if (!totalRecords) {
      throw new CustomNotFoundException({ messages: ['Users Not Found'] });
    }
    const page =
      isNaN(pageNumber) || Number(pageNumber) < 1 ? 1 : Number(pageNumber);
    const limit =
      isNaN(recordsPerPage) || recordsPerPage < 1 ? 10 : Number(recordsPerPage);
    const users = await findUsersQuery
      .leftJoinAndSelect('user.roles', 'roles')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: {
        users: plainToInstance(User, users, {
          excludeExtraneousValues: true,
        }),
        pagination: {
          totalPages,
          totalRecords,
          currentPage: page ?? 1,
          recordsPerPage: limit ?? 10,
        },
      },
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
    const { data: user } = (await this.findOneById(id)) ?? {};
    Object.assign(user, updateUserData);
    const savedUser = await this.userRepository.save(user);
    return this.buildUserResponse(savedUser, statusCodes.OK, statusMessages.OK);
  }

  async remove(
    id: string,
    stripeService: StripeService,
  ): Promise<UserResponseDto> {
    try {
      const { data: user } =
        (await this.findOneBy({ where: { id }, relations: ['inventories'] })) ??
        {};
      if (!!user?.inventories?.length) {
        throw new CustomBadRequest({
          messages: ['You cannot delete a user who still have inventories'],
        });
      }
      if (!!user.stripeAccountId) {
        await stripeService.deleteConnectedAccount(user.stripeAccountId);
      }
      await this.userRepository.delete(id);
      return this.buildUserResponse(user, statusCodes.OK, statusMessages.OK);
    } catch (err) {
      this.logError(err);
      throw new CustomInternalServerErrorException({
        messages: [
          'There was an error deleting a user, please check the logs, for more details',
        ],
      });
    }
  }

  private validateSellerId(sellerId: string): void {
    if (!sellerId) {
      throw new CustomBadRequest({ messages: ['Seller Id is required'] });
    }
  }

  private async findAndValidateSeller(sellerId: string): Promise<User> {
    const { data: sellerUser } = (await this.findOneById(sellerId)) ?? {};
    if (!sellerUser) {
      throw new CustomNotFoundException({ messages: ['Seller Not Found'] });
    }
    return sellerUser;
  }

  private ensureSellerIsNotActive(sellerUser: User): void {
    if (sellerUser.isActive) {
      throw new CustomConflictException({
        messages: ['Seller is already active'],
      });
    }
  }

  private async sendApprovalEmail(
    seller: User,
    stripeAccountOnboardingUrl: string,
  ): Promise<void> {
    const { html, text } = prepareAccountApprovedMessageBody({
      stripeAccountOnboardingUrl,
      getNewStripeAccountOnboardingUrl:
        getNewStripeAccountOnboardingUrl(seller),
      seller,
    });
    await this.mailService.sendEmail({
      fromEmailAddress: this.config.get<string>(APP_MAILING_ADDRESS),
      emailHtmlBody: html,
      emailTextBody: text,
      emailSubject: 'Your Seller Account Has Been Approved!',
      personalizations: [{ to: { email: seller.email } }],
    });
  }

  private throwUnauthorizedError(): void {
    throw new CustomUnauthorizedException({
      messages: [`${statusMessages.UNAUTHORIZED}: Invalid Credentials`],
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

  private buildUserResponse(
    user: User,
    status: number = statusCodes.CREATED,
    message: string = statusMessages.CREATED,
  ): UserResponseDto {
    return {
      status,
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
        const approvalUrl = `${this.config.get<string>(API_URL)}/orders/users/${savedUser.id}/approve-seller-account`;
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
        this.logError(err);
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
      throw new CustomNotFoundException({ messages: ['User Not Found'] });
    }
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: plainToInstance(User, user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  private buildFindUsersQuery(
    firstName?: string,
    lastName?: string,
    phoneNumber?: string,
    email?: string,
    shippingAddress?: string,
    isActive?: boolean,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
    sortOrder?: any,
  ): SelectQueryBuilder<User> {
    const query = this.userRepository.createQueryBuilder('user');

    if (firstName) {
      query.andWhere('user.firstName LIKE :firstName', {
        firstName: `%${firstName}%`,
      });
    }

    if (lastName) {
      query.andWhere('user.lastName LIKE :lastName', {
        lastName: `%${lastName}%`,
      });
    }

    if (phoneNumber) {
      query.andWhere('user.phoneNumber LIKE :phoneNumber', {
        phoneNumber: `%${phoneNumber}%`,
      });
    }

    if (email) {
      query.andWhere('user.email LIKE :email', {
        email: `%${email}%`,
      });
    }

    if (shippingAddress) {
      query.andWhere('user.shippingAddress LIKE :shippingAddress', {
        shippingAddress: `%${shippingAddress}%`,
      });
    }

    if (isActive) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    if (startDate) {
      query.andWhere('user.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('user.createdAt <= :endDate', { endDate });
    }

    const sortColumn = sortBy || 'createdAt';
    const sortOrderValue = sortOrder || 'DESC';

    query.orderBy(`user.${sortColumn}`, sortOrderValue);

    return query;
  }
}
