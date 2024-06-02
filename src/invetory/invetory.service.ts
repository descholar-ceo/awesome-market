import { Injectable } from '@nestjs/common';
import { CreateInvetoryDto } from './dto/create-invetory.dto';
import { UpdateInvetoryDto } from './dto/update-invetory.dto';

@Injectable()
export class InvetoryService {
  create(createInvetoryDto: CreateInvetoryDto) {
    return 'This action adds a new invetory';
  }

  findAll() {
    return `This action returns all invetory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invetory`;
  }

  update(id: number, updateInvetoryDto: UpdateInvetoryDto) {
    return `This action updates a #${id} invetory`;
  }

  remove(id: number) {
    return `This action removes a #${id} invetory`;
  }
}
