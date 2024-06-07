import { CustomNotFoundException } from '@/common/exception/custom.exception';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleResponseDto } from './dto/find-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

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

  async findById(id: string): Promise<RoleResponseDto> {
    return await this.findOneBy({ where: { id } });
  }

  async update(
    id: string,
    updateRoleData: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const { data: role } = (await this.findOneBy({ where: { id } })) ?? {};
    if (!role) {
      throw new CustomNotFoundException({ messages: ['Role Not Found'] });
    }
    Object.assign(role, updateRoleData);
    const savedRole = await this.roleRepository.save(role);
    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: savedRole,
    };
  }

  async remove(id: string): Promise<RoleResponseDto> {
    const { data: role } = (await this.findOneBy({ where: { id } })) ?? {};
    await this.roleRepository.delete(id);
    return { status: statusCodes.OK, message: statusMessages.OK, data: role };
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
      throw new CustomNotFoundException({
        messages: [statusMessages.NOT_FOUND],
      });
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
