import { Module } from '@nestjs/common';
import { InvetoryService } from './invetory.service';
import { InvetoryController } from './invetory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invetory } from './entities/invetory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invetory])],
  controllers: [InvetoryController],
  providers: [InvetoryService],
})
export class InvetoryModule {}
