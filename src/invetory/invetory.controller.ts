import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvetoryService } from './invetory.service';
import { CreateInvetoryDto } from './dto/create-invetory.dto';
import { UpdateInvetoryDto } from './dto/update-invetory.dto';

@Controller('invetory')
export class InvetoryController {
  constructor(private readonly invetoryService: InvetoryService) {}

  @Post()
  create(@Body() createInvetoryDto: CreateInvetoryDto) {
    return this.invetoryService.create(createInvetoryDto);
  }

  @Get()
  findAll() {
    return this.invetoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invetoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvetoryDto: UpdateInvetoryDto) {
    return this.invetoryService.update(+id, updateInvetoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invetoryService.remove(+id);
  }
}
