import { RoleService } from '@/role/role.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@/config/config.service';
import { DEFAULT_ROLE } from '@/config/config.utils';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly config: ConfigService,
  ) {}

  async create(createUserData: CreateUserDto) {
    const newUser = this.userRepository.create(createUserData);
    let defaultRole = (
      await this.roleService.find({
        name: this.config.get<string>(DEFAULT_ROLE),
      })
    )?.[0];
    if (!defaultRole) {
      defaultRole = await this.roleService.create({
        name: this.config.get<string>(DEFAULT_ROLE),
      });
    }
    newUser.roles = [defaultRole];
    const res = await this.userRepository.save(newUser);
    return plainToInstance(User, res, { excludeExtraneousValues: true });
  }

  async findAll() {
    return await this.userRepository.find();
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
}
