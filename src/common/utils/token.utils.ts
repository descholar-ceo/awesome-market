import * as jwt from 'jsonwebtoken';
import base64url from 'base64url';
import {
  ACCESS_JWT_EXPIRES,
  GENERAL_JWT_EXPIRES,
  JWT_SECRET,
  REFRESH_JWT_EXPIRES,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';
import { User } from '@/user/entities/user.entity';

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

export const generateTokens = async (
  user: User,
  tokenType: 'auth' | 'otherTokens' = 'auth',
): Promise<{
  accessToken?: string;
  refreshToken?: string;
  otherToken?: string;
}> => {
  const envConfigure = validateEnvironment(dotenvConfig);
  const { id, roles } = user;

  switch (tokenType) {
    case 'auth':
      const accessTokenData = {
        id,
        roles: (roles ?? []).map((currRole) => currRole.name) ?? [],
      };
      const refreshTokenData = { id };
      const accessToken = await encodeToken(
        accessTokenData,
        getEnvironmentValue<string>(envConfigure, ACCESS_JWT_EXPIRES),
      );
      const refreshToken = await encodeToken(
        refreshTokenData,
        getEnvironmentValue<string>(envConfigure, REFRESH_JWT_EXPIRES),
      );
      return { accessToken, refreshToken };

    case 'otherTokens':
      const otherTokenData = { id };
      const otherToken = await encodeToken(
        otherTokenData,
        getEnvironmentValue<string>(envConfigure, GENERAL_JWT_EXPIRES),
      );
      return { otherToken };

    default:
      throw new Error('Invalid tokenType');
  }
};
