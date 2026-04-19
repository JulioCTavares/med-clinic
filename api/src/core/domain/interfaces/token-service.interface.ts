export const ACCESS_TOKEN_SERVICE = Symbol('ITokenService:access');
export const REFRESH_TOKEN_SERVICE = Symbol('ITokenService:refresh');

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
}

export interface ITokenService {
  generateToken(payload: JwtTokenPayload): Promise<string>;
  verifyToken(token: string): Promise<boolean>;
  decodeToken(token: string): Promise<JwtTokenPayload>;
}
