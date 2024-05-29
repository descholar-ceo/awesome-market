import { Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import * as Joi from 'joi';
import { DEVELOPMENT, PRODUCTION, TEST } from 'src/common/constants.common';

interface EnvConfigure {
  [prop: string]: string;
}

export const NODE_ENV = 'NODE_ENV';
export const PORT = 'PORT';
export const HOST_PORT = 'HOST_PORT';
export const DB_HOST = 'DB_HOST';
export const HOST_DB_PORT = 'HOST_DB_PORT';
export const DB_PORT = 'DB_PORT';
export const DB_USERNAME = 'DB_USERNAME';
export const DB_PASSWORD = 'DB_PASSWORD';
export const DB_DATABASE = 'DB_DATABASE';

@Injectable()
export class ConfigService {
  private readonly envConfigure: EnvConfigure;

  constructor() {
    const configure = config().parsed;
    this.envConfigure = this.validateInput(configure);
  }

  get<T>(key: string): T {
    const envValue = this.envConfigure?.[key];
    if (!!envValue) {
      return envValue as T;
    } else {
      return null;
    }
  }

  private validateInput(envConfigure: EnvConfigure): EnvConfigure {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      [NODE_ENV]: Joi.string()
        .valid(DEVELOPMENT, PRODUCTION, TEST)
        .default(DEVELOPMENT)
        .required(),
      [PORT]: Joi.number().required(),
      [HOST_PORT]: Joi.number().required(),
      [DB_HOST]: Joi.string().required(),
      [HOST_DB_PORT]: Joi.string().required(),
      [DB_PORT]: Joi.number().required(),
      [DB_USERNAME]: Joi.string().required(),
      [DB_PASSWORD]: Joi.string().required(),
      [DB_DATABASE]: Joi.string().required(),
    });

    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfigure);
    if (!!error) {
      Logger.error(error, error.stack, this.constructor.name);
      process.exit(1);
    } else {
      return validatedEnvConfig;
    }
  }
}
