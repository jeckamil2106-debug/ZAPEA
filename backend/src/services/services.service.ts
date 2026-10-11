import {
  Injectable,
 NotFoundException,
ForbiddenException,
} from '@nestjs/common';

import { unlink } from 'fs/promises';
import { basename, join } from 'path';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
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
async findByCompany(companyId: string) {
  return this.prisma.service.findMany({
    where: {
      companyId,
    },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
  // ==========================================================
  // CREAR SERVICIO
  // ==========================================================

async create(
  companyId: string,
  data: {
    nombre: string;
    descripcion?: string;
    precioDesde?: number;
    imagenUrl?: string;
    destacado?: boolean;
  },
  user: {
    role: string;
    companyId?: string;
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
        'Empresa no encontrada.',
      );
    }

    return this.prisma.service.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precioDesde: data.precioDesde,
        imagenUrl: data.imagenUrl,
        destacado: data.destacado ?? true,

        company: {
          connect: {
            id: companyId,
          },
        },
      },

      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

// ==========================================================
  // LISTAR TODOS LOS SERVICIOS
  // GET /services
  // ==========================================================

  async findAll() {
    return this.prisma.service.findMany({
      include: {
        company: true,
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: [
        {
          destacado: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }
// ==========================================================
// BUSCAR SERVICIOS
// BÚSQUEDA POR RELEVANCIA
// ==========================================================

async search(texto: string) {
  const busqueda = texto.trim();

  // ========================================================
  // SIN BÚSQUEDA: DEVOLVER TODOS
  // ========================================================

  if (!busqueda) {
    return this.prisma.service.findMany({
      include: {
        company: true,
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: [
        {
          destacado: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  // ========================================================
  // NORMALIZAR TEXTO
  // ========================================================

  const normalizarTexto = (valor: unknown): string => {
    return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  // ========================================================
  // SEPARAR PALABRAS
  // ========================================================

  const palabras = busqueda
    .split(/\s+/)
    .map((palabra) => normalizarTexto(palabra))
    .filter(Boolean);

  if (palabras.length === 0) {
    return [];
  }

  // ========================================================
  // OBTENER SERVICIOS
  // ========================================================

  const servicios = await this.prisma.service.findMany({
    include: {
      company: true,
      images: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  // ========================================================
  // BUSCAR Y CALCULAR RELEVANCIA
  // ========================================================

  const resultados = servicios
    .map((servicio: any) => {
      const nombreServicio =
        normalizarTexto(servicio.nombre);

      const descripcionServicio =
        normalizarTexto(servicio.descripcion);

      const nombreEmpresa =
        normalizarTexto(servicio.company?.nombre);

      const categoriaEmpresa =
        normalizarTexto(servicio.company?.categoria);

      const direccionEmpresa =
        normalizarTexto(servicio.company?.direccion);

      const descripcionEmpresa =
        normalizarTexto(servicio.company?.descripcion);

      const textoCompleto = [
        nombreServicio,
        descripcionServicio,
        nombreEmpresa,
        categoriaEmpresa,
        direccionEmpresa,
        descripcionEmpresa,
      ].join(' ');

      let puntuacion = 0;
      let palabrasEncontradas = 0;

      // ====================================================
      // BUSCAR CADA PALABRA
      // ====================================================

      palabras.forEach((palabra) => {
        let encontrada = false;

        // Nombre exacto del servicio
        if (nombreServicio === palabra) {
          puntuacion += 20;
          encontrada = true;
        }

        // Nombre contiene la palabra
        else if (nombreServicio.includes(palabra)) {
          puntuacion += 12;
          encontrada = true;
        }

        // Descripción del servicio
        if (descripcionServicio.includes(palabra)) {
          puntuacion += 8;
          encontrada = true;
        }

        // Nombre de empresa
        if (nombreEmpresa.includes(palabra)) {
          puntuacion += 5;
          encontrada = true;
        }

        // Categoría
        if (categoriaEmpresa.includes(palabra)) {
          puntuacion += 5;
          encontrada = true;
        }

        // Ubicación
        if (direccionEmpresa.includes(palabra)) {
          puntuacion += 2;
          encontrada = true;
        }

        // Descripción empresa
        if (descripcionEmpresa.includes(palabra)) {
          puntuacion += 2;
          encontrada = true;
        }

        if (encontrada) {
          palabrasEncontradas++;
        }
      });

      // ====================================================
      // BONUS POR FRASE COMPLETA
      // ====================================================

      const busquedaNormalizada =
        normalizarTexto(busqueda);

      if (textoCompleto.includes(busquedaNormalizada)) {
        puntuacion += 25;
      }

      return {
        ...servicio,
        _puntuacion: puntuacion,
        _palabrasEncontradas: palabrasEncontradas,
      };
    })

    // ======================================================
    // SOLO RESULTADOS CON ALGUNA COINCIDENCIA
    // ======================================================

    .filter(
      (resultado) =>
        resultado._palabrasEncontradas > 0
    )

    // ======================================================
    // ORDENAR
    // ======================================================

    .sort((a, b) => {
      if (
        b._palabrasEncontradas !==
        a._palabrasEncontradas
      ) {
        return (
          b._palabrasEncontradas -
          a._palabrasEncontradas
        );
      }

      if (
        b._puntuacion !==
        a._puntuacion
      ) {
        return (
          b._puntuacion -
          a._puntuacion
        );
      }

      return 0;
    });

  // ========================================================
  // LIMPIAR DATOS INTERNOS
  // ========================================================

  return resultados.map(
    ({
      _puntuacion,
      _palabrasEncontradas,
      ...servicio
    }) => servicio
  );
}
  // ==========================================================
  // OBTENER UN SERVICIO
  // ==========================================================

async findOne(id: string) {
  console.log('🔎 FINDONE ID:', JSON.stringify(id));

  const servicios = await this.prisma.service.findMany({
    where: {
      id,
    },
    include: {
      images: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  console.log(
    '🔎 FINDONE RESULTADO:',
    JSON.stringify(servicios, null, 2),
  );

  if (servicios.length === 0) {
    throw new NotFoundException(
      'Servicio no encontrado.',
    );
  }

  return servicios[0];
}

  // ==========================================================
  // ACTUALIZAR SERVICIO
  // ==========================================================

  async update(
    id: string,
    data: {
      nombre?: string;
      descripcion?: string;
      precioDesde?: number;
      imagenUrl?: string;
      destacado?: boolean;
  },
  user: {
    role: string;
    companyId?: string;
  },
) {
    const servicio = await this.findOne(id);

await this.verificarAccesoEmpresa(
  servicio.companyId,
  user,
);

    return this.prisma.service.update({
      where: {
        id,
      },

      data: {
        ...(data.nombre !== undefined && {
          nombre: data.nombre,
        }),

        ...(data.descripcion !== undefined && {
          descripcion: data.descripcion,
        }),

        ...(data.precioDesde !== undefined && {
          precioDesde: data.precioDesde,
        }),

        ...(data.imagenUrl !== undefined && {
          imagenUrl: data.imagenUrl,
        }),

        ...(data.destacado !== undefined && {
          destacado: data.destacado,
        }),
      },

      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

   // ==========================================================
  // OBTENER IMÁGENES DE UN SERVICIO
  // ==========================================================

  async getImages(
    serviceId: string,
  ) {
    await this.findOne(serviceId);

    return this.prisma.serviceImage.findMany({
      where: {
        serviceId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

   // ==========================================================
  // AGREGAR MÚLTIPLES IMÁGENES AL SERVICIO
  // ==========================================================

  async addImages(
    serviceId: string,
    imageUrls: string[],
    user: {
      role: string;
      companyId?: string;
    },
  ) {
    const servicio = await this.findOne(
      serviceId,
    );

    await this.verificarAccesoEmpresa(
      servicio.companyId,
      user,
    );

    if (
      !imageUrls ||
      imageUrls.length === 0
    ) {
      return [];
    }

    const nuevasImagenes =
      await Promise.all(
        imageUrls.map((url) =>
          this.prisma.serviceImage.create({
            data: {
              url,
              serviceId,
            },
          }),
        ),
      );

    return nuevasImagenes;
  }
  // ==========================================================
  // ELIMINAR UNA IMAGEN DEL SERVICIO
  // ==========================================================

async removeImage(
  imageId: string,
  user: {
    role: string;
    companyId?: string;
  },
) {
    const imagen =
      await this.prisma.serviceImage.findUnique({
        where: {
          id: imageId,
        },
      });
      if (!imagen) {
  throw new NotFoundException(
    'Imagen del servicio no encontrada.',
  );
}
const servicio = await this.findOne(
  imagen.serviceId,
);

await this.verificarAccesoEmpresa(
  servicio.companyId,
  user,
);

    // ------------------------------------------
    // ELIMINAR ARCHIVO FÍSICO
    // ------------------------------------------

    if (imagen.url) {
      const nombreArchivo =
        basename(imagen.url);

      const rutaArchivo = join(
        process.cwd(),
        'uploads',
        'services',
        nombreArchivo,
      );

      try {
        await unlink(rutaArchivo);

        console.log(
          '🗑️ Imagen del servicio eliminada:',
          rutaArchivo,
        );
      } catch (error: any) {
        if (error?.code !== 'ENOENT') {
          console.error(
            'Error eliminando imagen:',
            error,
          );
        }
      }
    }

    // ------------------------------------------
    // ELIMINAR REGISTRO
    // ------------------------------------------

    return this.prisma.serviceImage.delete({
      where: {
        id: imageId,
      },
    });
  }

  // ==========================================================
  // REEMPLAZAR UNA IMAGEN DEL SERVICIO
  // ==========================================================

async replaceImage(
  imageId: string,
  newImageUrl: string,
  user: {
    role: string;
    companyId?: string;
  },
) {
    const imagen =
      await this.prisma.serviceImage.findUnique({
        where: {
          id: imageId,
        },
      });

    if (!imagen) {
      throw new NotFoundException(
        'Imagen del servicio no encontrada.',
      );
    }
const servicio = await this.findOne(
  imagen.serviceId,
);

await this.verificarAccesoEmpresa(
  servicio.companyId,
  user,
);
    // ------------------------------------------
    // ELIMINAR ARCHIVO ANTERIOR
    // ------------------------------------------

    if (imagen.url) {
      const nombreArchivoAnterior =
        basename(imagen.url);

      const rutaArchivoAnterior =
        join(
          process.cwd(),
          'uploads',
          'services',
          nombreArchivoAnterior,
        );

      try {
        await unlink(
          rutaArchivoAnterior,
        );
      } catch (error: any) {
        if (error?.code !== 'ENOENT') {
          console.error(
            'Error eliminando imagen anterior:',
            error,
          );
        }
      }
    }

    // ------------------------------------------
    // ACTUALIZAR REGISTRO
    // ------------------------------------------

    return this.prisma.serviceImage.update({
      where: {
        id: imageId,
      },

      data: {
        url: newImageUrl,
      },
    });
  }

  // ==========================================================
  // ELIMINAR SERVICIO
  // ==========================================================

  async remove(
    id: string,
    user: {
      role: string;
      companyId?: string;
    },
  ) {
    const servicio =
      await this.prisma.service.findUnique({
        where: {
          id,
        },
        include: {
          images: true,
        },
      });

    if (!servicio) {
      throw new NotFoundException(
        'Servicio no encontrado',
      );
    }

    await this.verificarAccesoEmpresa(
      servicio.companyId,
      user,
    );

    // ------------------------------------------
    // ELIMINAR ARCHIVOS DE SUS IMÁGENES
    // ------------------------------------------

    for (const imagen of servicio.images) {
      if (!imagen.url) {
        continue;
      }

      const nombreArchivo =
        basename(imagen.url);

      const rutaArchivo = join(
        process.cwd(),
        'uploads',
        'services',
        nombreArchivo,
      );

      try {
        await unlink(rutaArchivo);
      } catch (error: any) {
        if (error?.code !== 'ENOENT') {
          console.error(
            'Error eliminando archivo:',
            error,
          );
        }
      }
    }

    // ------------------------------------------
    // ELIMINAR REGISTROS DE IMÁGENES
    // ------------------------------------------

    await this.prisma.serviceImage.deleteMany({
      where: {
        serviceId: id,
      },
    });

    // ------------------------------------------
    // ELIMINAR SERVICIO
    // ------------------------------------------

    return this.prisma.service.delete({
      where: {
        id,
      },
    });
  }
    // ==========================================================
  // CONTAR SERVICIOS
  // GET /services/count
  // ==========================================================

  async count() {
    return this.prisma.service.count();
  }
}
