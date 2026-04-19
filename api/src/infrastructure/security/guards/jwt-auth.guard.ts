import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@/infrastructure/security/decorators/public.decorator';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const valid = await super.canActivate(context);
    if (!valid) return false;

    const request = context.switchToHttp().getRequest<{ user?: { jti: string } }>();
    const jti = request.user?.jti;
    if (jti) {
      const blacklisted = await this.cache.get(CacheKeys.blacklist(jti));
      if (blacklisted) throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
