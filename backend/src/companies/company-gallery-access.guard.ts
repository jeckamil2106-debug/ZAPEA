import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CompaniesService } from './companies.service';

@Injectable()
export class CompanyGalleryAccessGuard
  implements CanActivate
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest();

    const user = request.user;
    const imageId = request.params.imageId;

    if (!user) {
      throw new ForbiddenException(
        'Usuario no autenticado',
      );
    }

    if (!imageId) {
      throw new ForbiddenException(
        'Imagen no especificada',
      );
    }

    const image =
      await this.prisma.galleryImage.findUnique({
        where: {
          id: imageId,
        },
      });

    if (!image) {
      throw new NotFoundException(
        'Imagen de galería no encontrada',
      );
    }

    await this.companiesService.verificarAccesoEmpresa(
      image.companyId,
      user,
    );

    return true;
  }
}