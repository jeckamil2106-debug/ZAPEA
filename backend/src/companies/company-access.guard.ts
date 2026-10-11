import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { CompaniesService } from './companies.service';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const companyId = request.params.id;

    if (!user) {
      throw new ForbiddenException(
        'Usuario no autenticado',
      );
    }

    if (!companyId) {
      throw new ForbiddenException(
        'Empresa no especificada',
      );
    }

    await this.companiesService.verificarAccesoEmpresa(
      companyId,
      user,
    );

    return true;
  }
}