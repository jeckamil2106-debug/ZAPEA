import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {

constructor(
  private readonly jwtService: JwtService,
  private readonly prisma: PrismaService,
) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(
        'Token de acceso requerido',
      );
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Formato de token inválido',
      );
    }

    try {

      const payload = await this.jwtService.verifyAsync(
        token,
      );

request.user = payload;

// Verificar que la cuenta siga activa
if (payload.sub) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
    select: {
      isActive: true,
    },
  });

  if (user && !user.isActive) {
    throw new UnauthorizedException(
      'La cuenta se encuentra desactivada',
    );
  }
}

return true;

} catch (error) {

  if (error instanceof UnauthorizedException) {
    throw error;
  }

  throw new UnauthorizedException(
    'Token inválido o expirado',
  );
}
  }
}