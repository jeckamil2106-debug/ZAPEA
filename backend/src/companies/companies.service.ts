import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
 // ==========================================================
  // VERIFICAR PERMISO SOBRE UNA EMPRESA
  // ==========================================================

async verificarAccesoEmpresa(
  companyId: string,
  user: {
    role: string;
    sub: string;
  },
) {
  // ADMIN puede administrar cualquier empresa
  if (user.role === 'ADMIN') {
    return true;
  }

  // EMPRESA solamente puede administrar
  // una empresa que le pertenece
  if (user.role === 'EMPRESA') {
    const empresa = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        ownerId: user.sub,
      },
    });

    if (empresa) {
      return true;
    }
  }

  throw new ForbiddenException(
    'No tienes permiso para administrar esta empresa',
  );
}
  // ==========================================================
  // CREAR EMPRESA
  // ==========================================================

async create(
  createCompanyDto: CreateCompanyDto,
user: {
  sub: string;
  role: string;
},
) {
   if (user.role !== 'ADMIN') {
    throw new ForbiddenException(
      'Solo un administrador puede crear empresas',
    );
  }

 const ownerId: string | undefined = undefined;

  return this.prisma.company.create({
    data: {
      nombre: createCompanyDto.nombre,
      ruc: createCompanyDto.ruc,
      telefono: createCompanyDto.telefono,
      whatsapp: createCompanyDto.whatsapp,
      facebook: createCompanyDto.facebook,
email: createCompanyDto.email,
      direccion: createCompanyDto.direccion,
      latitud: createCompanyDto.latitud,
      longitud: createCompanyDto.longitud,
      descripcion: createCompanyDto.descripcion,
      categoria: createCompanyDto.categoria,

      logoUrl: createCompanyDto.logoUrl,
      portadaUrl: createCompanyDto.portadaUrl,

      ownerId,
    },
  });
}

  // ==========================================================
  // LISTAR EMPRESAS
  // ==========================================================

async findAll() {
  return this.prisma.company.findMany({
    select: {
      id: true,
      nombre: true,
      ruc: true,
      telefono: true,
      whatsapp: true,
      facebook: true,
      email: true,
      direccion: true,
      latitud: true,
      longitud: true,
      descripcion: true,
      categoria: true,
      logoUrl: true,
      portadaUrl: true,
      servicios: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
// ==========================================================
// LISTAR EMPRESAS DEL USUARIO AUTENTICADO
// ==========================================================

async findMyCompanies(
  user: {
    sub: string;
    role: string;
  },
) {
  // ADMIN puede ver todas las empresas
  if (user.role === 'ADMIN') {
    return this.prisma.company.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // EMPRESA solamente ve sus propias empresas
  return this.prisma.company.findMany({
    where: {
      ownerId: user.sub,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}
  // ==========================================================
  // BUSCAR UNA EMPRESA
  // ==========================================================

  async findOne(id: string) {
    const company =
      await this.prisma.company.findUnique({
        where: { id },
      });

    if (!company) {
      throw new NotFoundException(
        'Empresa no encontrada',
      );
    }

    return company;
  }

  // ==========================================================
  // ACTUALIZAR EMPRESA
  // ==========================================================

async update(
  id: string,
  updateCompanyDto: UpdateCompanyDto,
  user: { role: string; sub: string },
) {
  await this.findOne(id);

  await this.verificarAccesoEmpresa(
    id,
    user,
  );

    return this.prisma.company.update({
      where: { id },

      data: {
        nombre: updateCompanyDto.nombre,
        ruc: updateCompanyDto.ruc,
        telefono: updateCompanyDto.telefono,
        whatsapp: updateCompanyDto.whatsapp,
        facebook: updateCompanyDto.facebook,
        email: updateCompanyDto.email,
        direccion: updateCompanyDto.direccion,
        latitud: updateCompanyDto.latitud,
        longitud: updateCompanyDto.longitud,
        descripcion: updateCompanyDto.descripcion,
        categoria: updateCompanyDto.categoria,
        servicios: updateCompanyDto.servicios,

        logoUrl: updateCompanyDto.logoUrl,
        portadaUrl: updateCompanyDto.portadaUrl,
      },
    });
  }

  // ==========================================================
  // ACTUALIZAR LOGO Y PORTADA
  // ==========================================================

async updateImages(
  id: string,
  user: { role: string; sub: string },
  logoUrl?: string,
  portadaUrl?: string,
) {
  await this.findOne(id);

  await this.verificarAccesoEmpresa(
    id,
    user,
  );

    return this.prisma.company.update({
      where: { id },

      data: {
        ...(logoUrl !== undefined && {
          logoUrl,
        }),

        ...(portadaUrl !== undefined && {
          portadaUrl,
        }),
      },
    });
  }

  // ==========================================================
  // OBTENER GALERÍA DE UNA EMPRESA
  // ==========================================================

  async getGallery(id: string) {
    await this.findOne(id);

    return this.prisma.galleryImage.findMany({
      where: {
        companyId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ==========================================================
  // AGREGAR IMAGEN A LA GALERÍA
  // ==========================================================

async addGalleryImage(
  id: string,
  imageUrl: string,
  user: { role: string; sub: string },
) {
  await this.findOne(id);

  await this.verificarAccesoEmpresa(
    id,
    user,
  );

  return this.prisma.galleryImage.create({
    data: {
      url: imageUrl,
      companyId: id,
    },
  });
}

// =====================================================
// ELIMINAR UNA IMAGEN DE LA GALERÍA
// =====================================================

async removeGalleryImage(
  imageId: string,
  user: { role: string; sub: string},
) {
  const image = await this.prisma.galleryImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    throw new NotFoundException(
      "Imagen de galería no encontrada",
    );
  }
  await this.verificarAccesoEmpresa(
  image.companyId,
  user,
);

  // ============================================
  // ELIMINAR ARCHIVO FÍSICO
  // ============================================

  if (image.url) {
    const nombreArchivo = basename(image.url);

    const rutaArchivo = join(
      process.cwd(),
      "uploads",
      "companies",
      nombreArchivo,
    );

    try {
      await unlink(rutaArchivo);

      console.log(
        "Archivo físico eliminado:",
        rutaArchivo,
      );
    } catch (error: any) {
      // Si el archivo ya no existe,
      // continuamos con la eliminación de la BD.
      if (error?.code !== "ENOENT") {
        console.error(
          "Error eliminando archivo físico:",
          error,
        );
      }
    }
  }

  // ============================================
  // ELIMINAR REGISTRO DE LA BASE DE DATOS
  // ============================================

  return this.prisma.galleryImage.delete({
    where: {
      id: imageId,
    },
  });
}
  // ============================================================
// REEMPLAZAR UNA SOLA IMAGEN DE LA GALERÍA
// ============================================================

async replaceGalleryImage(
  imageId: string,
  newImageUrl: string,
  user: { role: string; sub: string },
) {
  // Buscar la imagen que se quiere reemplazar
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
await this.verificarAccesoEmpresa(
  image.companyId,
  user,
);
  // Eliminar físicamente la imagen anterior
  try {
    const nombreArchivoAnterior =
      basename(image.url);

    const rutaArchivoAnterior = join(
      process.cwd(),
      'uploads',
      'companies',
      nombreArchivoAnterior,
    );

    await unlink(rutaArchivoAnterior);
} catch (error: any) {
  if (error.code !== 'ENOENT') {
    throw error;
  }

  console.log(
    `El archivo anterior no existe físicamente: ${image.url}`,
  );
}

  // Actualizar SOLO esta imagen
  return this.prisma.galleryImage.update({
    where: {
      id: imageId,
    },
    data: {
      url: newImageUrl,
    },
  });
}
  // ============================================================
// REEMPLAZAR TODA LA GALERÍA
// ============================================================

async replaceGalleryImages(
  id: string,
  imageUrls: string[],
  user: { role: string; sub: string },
) {
  // Verificar que la empresa exista
  await this.findOne(id);

  // Verificar que el usuario tenga permiso
  await this.verificarAccesoEmpresa(
    id,
    user,
  );

  // Obtener las imágenes actuales antes de eliminarlas
  const imagenesAnteriores =
    await this.prisma.galleryImage.findMany({
      where: {
        companyId: id,
      },
    });

  // Eliminar los registros anteriores de la base de datos
  await this.prisma.galleryImage.deleteMany({
    where: {
      companyId: id,
    },
  });

  // Eliminar físicamente los archivos anteriores
  for (const imagen of imagenesAnteriores) {
    try {
      const nombreArchivo = basename(imagen.url);

      const rutaArchivo = join(
        process.cwd(),
        'uploads',
        'companies',
        nombreArchivo,
      );

      await unlink(rutaArchivo);
    } catch (error) {
      // Si el archivo ya no existe,
      // continuamos sin detener el reemplazo.
      console.log(
        `No se pudo eliminar el archivo anterior: ${imagen.url}`,
      );
    }
  }

  // Si no llegan imágenes nuevas,
  // dejar la galería vacía.
  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  // Crear las nuevas imágenes
  const nuevasImagenes = await Promise.all(
    imageUrls.map((imageUrl) =>
      this.prisma.galleryImage.create({
        data: {
          url: imageUrl,
          companyId: id,
        },
      }),
    ),
  );

  return nuevasImagenes;
}

  // ==========================================================
  // ELIMINAR EMPRESA
  // ==========================================================

async remove(
  id: string,
  user: { role: string; sub: string },
) {
  await this.findOne(id);

  await this.verificarAccesoEmpresa(
    id,
    user,
  );

  return this.prisma.company.delete({
    where: { id },
  });
}
}