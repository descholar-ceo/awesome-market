import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleData: CreateRoleDto) {
    const newRole = this.roleRepository.create(createRoleData);
    return await this.roleRepository.save(newRole);
  }

  async findAll() {
    return await this.roleRepository.find();
  }

  async findOne(id: string) {
    return await this.roleRepository.findBy({ id });
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
}
