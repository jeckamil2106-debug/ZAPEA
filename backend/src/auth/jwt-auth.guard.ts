import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
constructor(
  private readonly jwtService: JwtService,
  private readonly prisma: PrismaService,
) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest();

    const authorization =
      request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'No se proporcionó el token de acceso',
      );
    }

const match = authorization.match(
  /^Bearer\s+(.+)$/i,
);

if (!match) {
  throw new UnauthorizedException(
    'Formato de token inválido',
  );
}

const token = match[1]
  .trim()
  .replace(/^"|"$/g, '');
  console.log('🔎 JWT diagnóstico:', {
  longitud: token.length,
  partes: token.split('.').length,
  longitudes: token.split('.').map((parte) => parte.length),
});

    try {
      const payload =
        await this.jwtService.verifyAsync(
          token,
        );

      const user = await this.prisma.user.findUnique({
  where: {
    id: payload.sub,
  },
  select: {
    id: true,
    isActive: true,
  },
});

if (!user) {
  throw new UnauthorizedException(
    'Usuario no encontrado',
  );
}

if (!user.isActive) {
  throw new UnauthorizedException(
    'La cuenta se encuentra desactivada',
  );
}

request.user = payload;

return true;
} catch (error) {
  console.error('❌ ERROR JWT:', error);

  throw new UnauthorizedException(
    'Token inválido o expirado',
  );
}
  }
}