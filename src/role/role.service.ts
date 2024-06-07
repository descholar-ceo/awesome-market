import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { plainToInstance } from 'class-transformer';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { RoleResponseDto } from './dto/find-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(
    createRoleData: CreateRoleDto,
    queryRunner?: QueryRunner,
  ): Promise<RoleResponseDto> {
    const newRole = this.roleRepository.create(createRoleData);
    let savedRole: Role;
    if (!!queryRunner) {
      savedRole = await queryRunner.manager.save(newRole);
    } else {
      savedRole = await this.roleRepository.save(newRole);
    }
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: savedRole,
    };
  }

  async findOneByName(
    name: string,
    queryRunner?: QueryRunner,
  ): Promise<RoleResponseDto> {
    return await this.findOneBy({ where: { name } }, queryRunner);
  }
  async findAll() {
    return await this.roleRepository.find();
  }

  async find(where: Record<string, any>) {
    return await this.roleRepository.find({ where });
  }

  async findById(id: string): Promise<Role> {
    return await this.roleRepository.findOneBy({ id });
  }

  async update(id: string, updateRoleData: UpdateRoleDto) {
    const role = await this.roleRepository.findBy({ id });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    Object.assign(role, updateRoleData);
    return await this.roleRepository.save(role);
  }

  async remove(id: string) {
    await this.roleRepository.delete(id);
  }

  private async findOneBy(
    whereCondition: FindOneOptions<Role>,
    queryRunner?: QueryRunner,
  ): Promise<RoleResponseDto> {
    let role: Role;
    if (!!queryRunner) {
      role = await queryRunner.manager.findOne(Role, whereCondition);
    } else {
      role = await this.roleRepository.findOne(whereCondition);
    }
    if (!role) {
      return {
        status: statusCodes.NOT_FOUND,
        message: statusMessages.NOT_FOUND,
      };
    }
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: plainToInstance(Role, role, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
