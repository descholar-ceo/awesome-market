import {
  DEFAULT_SHIPPING_ADDRESS,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';

const envConfigure = validateEnvironment(dotenvConfig);
export const DEFAULT_SHIPPING_ADDRESS_VALUE = getEnvironmentValue<string>(
  envConfigure,
  DEFAULT_SHIPPING_ADDRESS,
);
