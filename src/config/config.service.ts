import { Injectable } from '@nestjs/common';
import {
  EnvConfigure,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from './config.utils';

@Injectable()
export class ConfigService {
  private readonly envConfigure: EnvConfigure;

  constructor() {
    this.envConfigure = validateEnvironment(dotenvConfig);
  }

  get<T>(key: string): T {
    return getEnvironmentValue<T>(this.envConfigure, key);
  }
}
