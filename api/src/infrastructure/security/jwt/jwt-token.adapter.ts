import { JwtService } from '@nestjs/jwt';
import type { ITokenService, JwtTokenPayload } from '@/core/domain/interfaces/token-service.interface';

export class JwtTokenAdapter implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  async generateToken(payload: JwtTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: this.expiresIn as never,
    });
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, { secret: this.secret });
      return true;
    } catch {
      return false;
    }
  }

  async decodeToken(token: string): Promise<JwtTokenPayload> {
    return this.jwtService.verifyAsync<JwtTokenPayload>(token, { secret: this.secret });
  }
}
