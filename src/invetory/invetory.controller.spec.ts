import { Test, TestingModule } from '@nestjs/testing';
import { InvetoryController } from './invetory.controller';
import { InvetoryService } from './invetory.service';

describe('InvetoryController', () => {
  let controller: InvetoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvetoryController],
      providers: [InvetoryService],
    }).compile();

    controller = module.get<InvetoryController>(InvetoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
