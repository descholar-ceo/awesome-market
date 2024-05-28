import { Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import * as Joi from 'joi';
import { DEVELOPMENT, PRODUCTION, TEST } from 'src/common/constants.common';

interface EnvConfigure {
  [prop: string]: string;
}

export const NODE_ENV = 'NODE_ENV';
export const PORT = 'PORT';

@Injectable()
export class ConfigService {
  private readonly envConfigure: EnvConfigure;

  constructor() {
    const configure = config().parsed;
    this.envConfigure = this.validateInput(configure);
  }

  get(key: string): string {
    return this.envConfigure[key];
  }

  private validateInput(envConfigure: EnvConfigure): EnvConfigure {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      [NODE_ENV]: Joi.string()
        .valid(DEVELOPMENT, PRODUCTION, TEST)
        .default(DEVELOPMENT)
        .required(),
      [PORT]: Joi.number().required(),
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
