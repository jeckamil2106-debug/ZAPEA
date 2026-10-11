import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class SucursalService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================================
  // VERIFICAR ACCESO A LA EMPRESA
  // ==========================================================

private async verificarAccesoEmpresa(
  companyId: string,
  user: {
    role: string;
    companyId?: string;
  },
) {
  if (user.role === 'ADMIN') {
    return;
  }

  if (
    user.role === 'EMPRESA' &&
    user.companyId === companyId
  ) {
    return;
  }

  throw new ForbiddenException(
    'No tienes permiso para administrar esta empresa',
  );
}
  // ==========================================================
  // CREAR SUCURSAL
  // ==========================================================

  async create(
    companyId: string,
    data: {
      nombre: string;
      direccion?: string;
      telefono?: string;
      whatsapp?: string;
      email?: string;
      horario?: string;
      latitud?: number;
      longitud?: number;
    },
    user: {
      role: string;
      sub?: string;
    },
  ) {
    await this.verificarAccesoEmpresa(
      companyId,
      user,
    );

    const empresa =
      await this.prisma.company.findUnique({
        where: {
          id: companyId,
        },
      });

    if (!empresa) {
      throw new NotFoundException(
        'Empresa no encontrada',
      );
    }

    return this.prisma.sucursal.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
        whatsapp: data.whatsapp,
        email: data.email,
        horario: data.horario,
        latitud: data.latitud,
        longitud: data.longitud,
        companyId,
      },
    });
  }

  // ==========================================================
  // LISTAR SUCURSALES DE UNA EMPRESA
  // ==========================================================

  async findAll(
    companyId: string,
    user: {
      role: string;
      sub?: string;
    },
  ) {
    await this.verificarAccesoEmpresa(
      companyId,
      user,
    );

    return this.prisma.sucursal.findMany({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

 // ==========================================================
  // LISTAR SUCURSALES PÚBLICAS DE UNA EMPRESA
  // ==========================================================

  async findAllPublic(companyId: string) {
    const empresa =
      await this.prisma.company.findUnique({
        where: {
          id: companyId,
        },
      });

    if (!empresa) {
      throw new NotFoundException(
        'Empresa no encontrada',
      );
    }

    return this.prisma.sucursal.findMany({
      where: {
        companyId,
        activo: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        telefono: true,
        whatsapp: true,
        email: true,
        horario: true,
        latitud: true,
        longitud: true,
      },
    });
  }

// ==========================================================
  // LISTAR TODAS LAS SUCURSALES PÚBLICAS
  // ==========================================================

  async findAllPublicas() {
    return this.prisma.sucursal.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        telefono: true,
        whatsapp: true,
        email: true,
        horario: true,
        latitud: true,
        longitud: true,
        companyId: true,
        company: {
          select: {
            id: true,
            nombre: true,
            categoria: true,
            direccion: true,
            latitud: true,
            longitud: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  // ==========================================================
  // BUSCAR UNA SUCURSAL
  // ==========================================================

  async findOne(
    id: string,
    user: {
      role: string;
      sub?: string;
    },
  ) {
    const sucursal =
      await this.prisma.sucursal.findUnique({
        where: {
          id,
        },
      });

    if (!sucursal) {
      throw new NotFoundException(
        'Sucursal no encontrada',
      );
    }

    await this.verificarAccesoEmpresa(
      sucursal.companyId,
      user,
    );

    return sucursal;
  }

  // ==========================================================
  // ACTUALIZAR SUCURSAL
  // ==========================================================

  async update(
    id: string,
    data: {
      nombre?: string;
      direccion?: string;
      telefono?: string;
      whatsapp?: string;
      email?: string;
      horario?: string;
      latitud?: number;
      longitud?: number;
      activo?: boolean;
    },
    user: {
      role: string;
      sub?: string;
    },
  ) {
 console.log('🔎 UPDATE SERVICE:', {
  id,
  data,
  user,
});   
    const sucursal =
      await this.prisma.sucursal.findUnique({
        where: {
          id,
        },
      });

    if (!sucursal) {
      throw new NotFoundException(
        'Sucursal no encontrada',
      );
    }

    await this.verificarAccesoEmpresa(
      sucursal.companyId,
      user,
    );

    return this.prisma.sucursal.update({
      where: {
        id,
      },
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
        whatsapp: data.whatsapp,
        email: data.email,
        horario: data.horario,
        latitud: data.latitud,
        longitud: data.longitud,
        activo: data.activo,
      },
    });
  }

  // ==========================================================
  // ELIMINAR SUCURSAL
  // ==========================================================

  async remove(
    id: string,
    user: {
      role: string;
      sub?: string;
    },
  ) {
    const sucursal =
      await this.prisma.sucursal.findUnique({
        where: {
          id,
        },
      });

    if (!sucursal) {
      throw new NotFoundException(
        'Sucursal no encontrada',
      );
    }

    await this.verificarAccesoEmpresa(
      sucursal.companyId,
      user,
    );

    return this.prisma.sucursal.delete({
      where: {
        id,
      },
    });
  }
}