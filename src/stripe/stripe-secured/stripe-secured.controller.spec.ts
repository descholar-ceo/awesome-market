import { Test, TestingModule } from '@nestjs/testing';
import { StripeSecuredController } from './stripe-secured.controller';

describe('StripeSecuredController', () => {
  let controller: StripeSecuredController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeSecuredController],
    }).compile();

    controller = module.get<StripeSecuredController>(StripeSecuredController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
