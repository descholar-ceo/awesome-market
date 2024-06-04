import { Logger } from '@nestjs/common';
import * as Joi from 'joi';
import { DEVELOPMENT, PRODUCTION, TEST } from '../common/constants.common';
import { config } from 'dotenv';

export const dotenvConfig = config({ path: '.env' }).parsed;

export interface EnvConfigure {
  [prop: string]: string;
}

export const getEnvironmentValue = <T>(
  envConfigure: { [key: string]: any },
  key: string,
): T => {
  const envValue = envConfigure?.[key];
  if (!!envValue) {
    return envValue as T;
  } else {
    return null;
  }
};

export const NODE_ENV = 'NODE_ENV';
export const PORT = 'PORT';
export const HOST_PORT = 'HOST_PORT';
export const DB_HOST = 'DB_HOST';
export const HOST_DB_PORT = 'HOST_DB_PORT';
export const DB_PORT = 'DB_PORT';
export const DB_USERNAME = 'DB_USERNAME';
export const DB_PASSWORD = 'DB_PASSWORD';
export const DB_DATABASE = 'DB_DATABASE';
export const BUYER_ROLE = 'BUYER_ROLE';
export const SELLER_ROLE = 'SELLER_ROLE';
export const ADMIN_ROLE = 'ADMIN_ROLE';
export const JWT_SECRET = 'JWT_SECRET';
export const REFRESH_JWT_EXPIRES = 'REFRESH_JWT_EXPIRES';
export const ACCESS_JWT_EXPIRES = 'ACCESS_JWT_EXPIRES';
export const INITIAL_ADMIN_EMAIL = 'INITIAL_ADMIN_EMAIL';
export const INITIAL_ADMIN_PHONE = 'INITIAL_ADMIN_PHONE';
export const INITIAL_ADMIN_FNAME = 'INITIAL_ADMIN_FNAME';
export const INITIAL_ADMIN_LNAME = 'INITIAL_ADMIN_LNAME';
export const INITIAL_ADMIN_PASSWORD = 'INITIAL_ADMIN_PASSWORD';
export const SENDGRID_API_KEY = 'SENDGRID_API_KEY';
export const APP_MAILING_ADDRESS = 'APP_MAILING_ADDRESS';
export const API_URL = 'API_URL';
export const STRIPE_TEST_SECRET_KEY = 'STRIPE_TEST_SECRET_KEY';

export const validateEnvironment = (
  envConfigure: EnvConfigure,
): EnvConfigure => {
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
    [BUYER_ROLE]: Joi.string().required(),
    [SELLER_ROLE]: Joi.string().required(),
    [ADMIN_ROLE]: Joi.string().required(),
    [JWT_SECRET]: Joi.string().required(),
    [ACCESS_JWT_EXPIRES]: Joi.string().required(),
    [REFRESH_JWT_EXPIRES]: Joi.string().required(),
    [INITIAL_ADMIN_EMAIL]: Joi.string().required(),
    [INITIAL_ADMIN_PHONE]: Joi.string().required(),
    [INITIAL_ADMIN_FNAME]: Joi.string().required(),
    [INITIAL_ADMIN_LNAME]: Joi.string().required(),
    [INITIAL_ADMIN_PASSWORD]: Joi.string().required(),
    [SENDGRID_API_KEY]: Joi.string().optional(),
    [APP_MAILING_ADDRESS]: Joi.string().optional(),
    [API_URL]: Joi.string().required(),
    [STRIPE_TEST_SECRET_KEY]: Joi.string().required(),
  });

  const { error, value: validatedEnvConfig } =
    envVarsSchema.validate(envConfigure);
  if (!!error) {
    Logger.error(error, error.stack);
    process.exit(1);
  } else {
    return validatedEnvConfig;
  }
};
