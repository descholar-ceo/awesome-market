import * as jwt from 'jsonwebtoken';
import base64url from 'base64url';
import {
  JWT_SECRET,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';

const envConfigure = validateEnvironment(dotenvConfig);

export const encodeToken = async (dataToEncode, expiresIn): Promise<string> => {
  return await jwt.sign(
    dataToEncode,
    getEnvironmentValue<string>(envConfigure, JWT_SECRET),
    {
      expiresIn,
      algorithm: 'HS256',
    },
  );
};

export const decodeToken = (token: string): any => {
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimStart();
  }
  const base4tokenHeader = JSON.parse(base64url.decode(token.split('.')[0]));
  if (
    !base4tokenHeader.alg ||
    base4tokenHeader.alg !== 'HS256' ||
    base4tokenHeader.typ !== 'JWT'
  ) {
    return false;
  }
  return jwt.verify(
    token,
    getEnvironmentValue<string>(envConfigure, JWT_SECRET),
  );
};
