import { CustomNotFoundException } from '@/common/exception/custom.exception';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  FindOneOptions,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  FindRoleFiltersDto,
  RoleResponseDto,
  RolesResponseDto,
} from './dto/find-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { getDateInterval } from '@/common/utils/dates.utils';

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

  async findWithFilters(
    filters: FindRoleFiltersDto,
  ): Promise<RolesResponseDto> {
    const {
      name,
      createdFromDate,
      createdToDate,
      pageNumber,
      recordsPerPage,
      sortBy,
      sortOrder,
    } = filters;
    const { startDate, endDate } = getDateInterval(
      createdFromDate,
      createdToDate,
    );
    const findRolesQuery = this.buildFindRolesQuery(
      name,
      startDate,
      endDate,
      sortBy,
      sortOrder?.toUpperCase(),
    );

    const totalRecords = await findRolesQuery.getCount();
    if (!totalRecords) {
      throw new CustomNotFoundException({ messages: ['Roles Not Found'] });
    }
    const page =
      isNaN(pageNumber) || Number(pageNumber) < 1 ? 1 : Number(pageNumber);
    const limit =
      isNaN(recordsPerPage) || recordsPerPage < 1 ? 10 : Number(recordsPerPage);
    const roles = await findRolesQuery
      .leftJoinAndSelect('role.users', 'users')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      status: statusCodes.OK,
      message: statusMessages.OK,
      data: {
        roles: plainToInstance(Role, roles, {
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

  private buildFindRolesQuery(
    name?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
    sortOrder?: any,
  ): SelectQueryBuilder<Role> {
    const query = this.roleRepository.createQueryBuilder('role');

    if (name) {
      query.andWhere('role.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (startDate) {
      query.andWhere('role.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('role.createdAt <= :endDate', { endDate });
    }

    const sortColumn = sortBy || 'createdAt';
    const sortOrderValue = sortOrder || 'DESC';

    query.orderBy(`role.${sortColumn}`, sortOrderValue);

    return query;
  }
}
