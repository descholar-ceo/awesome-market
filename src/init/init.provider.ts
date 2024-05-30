import { Provider } from '@nestjs/common';
import { InitService } from './init.service';

export const InitialAdminProvider: Provider = {
  provide: 'INITIAL_ADMIN_DATA',
  useFactory: async (initService: InitService) =>
    await initService.createInitialDatabaseDataNeededToWork(),
  inject: [InitService],
};
