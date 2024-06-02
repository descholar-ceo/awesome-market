import { Test, TestingModule } from '@nestjs/testing';
import { InvetoryService } from './invetory.service';

describe('InvetoryService', () => {
  let service: InvetoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvetoryService],
    }).compile();

    service = module.get<InvetoryService>(InvetoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
