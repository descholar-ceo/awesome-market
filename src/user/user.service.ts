import { statusCodes, statusNames } from '@/common/utils/status.utils';
import { decodeToken, encodeToken } from '@/common/utils/token.utils';
import { ConfigService } from '@/config/config.service';
import {
  ACCESS_JWT_EXPIRES,
  BUYER_ROLE,
  NODE_ENV,
  REFRESH_JWT_EXPIRES,
} from '@/config/config.utils';
import { RoleService } from '@/role/role.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PRODUCTION } from '@/common/constants.common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly config: ConfigService,
  ) {}

  async create(createUserData: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserData);
    const buyerRoleName = this.config.get<string>(BUYER_ROLE);
    let defaultRole = (
      await this.roleService.find({
        name: buyerRoleName,
      })
    )?.[0];
    if (!defaultRole) {
      defaultRole = await this.roleService.create({
        name: buyerRoleName,
      });
    }
    if (!createUserData?.roles?.length) {
      newUser.roles = [defaultRole];
    }
    const savedUser = await this.userRepository.save(newUser);
    return plainToInstance(User, savedUser, { excludeExtraneousValues: true });
  }

  async login(loginData: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginData;
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!user) {
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
        message: 'Refresh token missing from headers',
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

  async remove(id: string) {
    await this.userRepository.delete(id);
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
