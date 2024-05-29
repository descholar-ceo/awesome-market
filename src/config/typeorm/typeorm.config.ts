import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
  NODE_ENV,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '../../config/config.utils';
import { CustomNamingStrategy } from '../../config/naming-strategies';
import { DEVELOPMENT } from '../../common/constants.common';

const envConfigure = validateEnvironment(dotenvConfig);

const config = {
  type: 'postgres',
  host: getEnvironmentValue<string>(envConfigure, DB_HOST),
  port: getEnvironmentValue<number>(envConfigure, DB_PORT),
  username: getEnvironmentValue<string>(envConfigure, DB_USERNAME),
  password: getEnvironmentValue<string>(envConfigure, DB_PASSWORD),
  database: getEnvironmentValue<string>(envConfigure, DB_DATABASE),
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
  retryAttempts: 15,
  retryDelay: 30000,
  logging:
    getEnvironmentValue<string>(envConfigure, NODE_ENV) === DEVELOPMENT
      ? true
      : false,
  namingStrategy: new CustomNamingStrategy(),
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
