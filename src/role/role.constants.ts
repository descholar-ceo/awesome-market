import {
  ADMIN_ROLE,
  BUYER_ROLE,
  SELLER_ROLE,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';

const envConfigure = validateEnvironment(dotenvConfig);
export const ADMIN_ROLE_NAME = getEnvironmentValue<string>(
  envConfigure,
  ADMIN_ROLE,
);
export const SELLER_ROLE_NAME = getEnvironmentValue<string>(
  envConfigure,
  SELLER_ROLE,
);
export const BUYER_ROLE_NAME = getEnvironmentValue<string>(
  envConfigure,
  BUYER_ROLE,
);
