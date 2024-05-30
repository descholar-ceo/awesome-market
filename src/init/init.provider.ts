import { Provider } from '@nestjs/common';
import { InitService } from './init.service';
import { INITIALIZE_DB } from '@/common/constants.common';

export const InitialAdminProvider: Provider = {
  provide: INITIALIZE_DB,
  useFactory: async (initService: InitService) =>
    await initService.createInitialDatabaseDataNeededToWork(),
  inject: [InitService],
};
