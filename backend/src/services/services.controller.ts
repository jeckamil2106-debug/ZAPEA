import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import {
  extname,
  join,
  basename,
} from 'path';

import {
  existsSync,
  unlinkSync,
} from 'fs';

import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
@Controller('services')
@ApiBearerAuth('access-token')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
  ) {}
  // ==========================================================
  // LISTAR TODOS LOS SERVICIOS
  // GET /services
  // ==========================================================

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // ==========================================================
  // CREAR SERVICIO
  // POST /services/company/:companyId
  // ==========================================================

@UseGuards(JwtAuthGuard)
@Post('company/:companyId')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        example: 'Servicio de prueba ZAPEA',
      },
      descripcion: {
        type: 'string',
        example: 'Servicio creado para prueba',
      },
      precioDesde: {
        type: 'number',
        example: 100,
      },
      imagenUrl: {
        type: 'string',
        example: '',
      },
      destacado: {
        type: 'boolean',
        example: true,
      },
    },
    required: ['nombre'],
  },
})
create(
    @Param('companyId')
    companyId: string,

@Body()
body: {
  nombre: string;
  descripcion?: string;
  precioDesde?: number;
  imagenUrl?: string;
  destacado?: boolean;
},
@Req() req: any,
) {
return this.servicesService.create(
  companyId,
  body,
  req.user,
);
  }

  // ==========================================================
  // SUBIR MÚLTIPLES IMÁGENES
  // POST /services/:id/images
  // ==========================================================
@UseGuards(JwtAuthGuard)
  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor(
      'imagenes',
      20,
      {
        storage: diskStorage({
          destination:
            './uploads/services',

          filename: (
            req,
            file,
            callback,
          ) => {
            const extension =
              extname(
                file.originalname,
              );

            const nombreArchivo =
              `${Date.now()}-${Math.round(
                Math.random() * 1e9,
              )}${extension}`;

            callback(
              null,
              nombreArchivo,
            );
          },
        }),
      },
    ),
  )
  async subirImagenes(
    @Param('id')
    id: string,

    @UploadedFiles()
    files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (
      !files ||
      files.length === 0
    ) {
      throw new Error(
        'No se recibieron imágenes.',
      );
    }

    const imageUrls =
      files.map(
        (file) =>
          `/uploads/services/${file.filename}`,
      );

let imagenes;

try {
  imagenes =
    await this.servicesService.addImages(
      id,
      imageUrls,
      req.user,
    );
} catch (error) {
  for (const file of files) {
    try {
      unlinkSync(
        join(
          process.cwd(),
          'uploads',
          'services',
          file.filename,
        ),
      );
    } catch (fileError) {
      if (
        (fileError as NodeJS.ErrnoException).code !==
        'ENOENT'
      ) {
        console.error(
          'Error eliminando archivo temporal:',
          fileError,
        );
      }
    }
  }

  throw error;
}

    return {
      message:
        'Imágenes agregadas correctamente',
      cantidad: imagenes.length,
      imagenes,
    };
  }

  // ==========================================================
  // OBTENER IMÁGENES DE UN SERVICIO
  // GET /services/:id/images
  // ==========================================================

  @Get(':id/images')
  getImages(
    @Param('id')
    id: string,
  ) {
    return this.servicesService.getImages(
      id,
    );
  }

  // ==========================================================
  // REEMPLAZAR UNA IMAGEN DEL SERVICIO
  // PATCH /services/:id/images/:imageId
  // ==========================================================

  @UseGuards(JwtAuthGuard)
  @Patch(
    ':id/images/:imageId',
  )
  @UseInterceptors(
    FileInterceptor(
      'imagen',
      {
        storage: diskStorage({
          destination:
            './uploads/services',

          filename: (
            req,
            file,
            callback,
          ) => {
            const extension =
              extname(
                file.originalname,
              );

            const nombreArchivo =
              `${Date.now()}-${Math.round(
                Math.random() * 1e9,
              )}${extension}`;

            callback(
              null,
              nombreArchivo,
            );
          },
        }),
      },
    ),
  )
  async reemplazarImagen(
    @Param('id')
    id: string,

    @Param('imageId')
    imageId: string,

@UploadedFile()
file: Express.Multer.File,

@Req() req: any,
) {
    // Verificar que el servicio exista
    await this.servicesService.findOne(
      id,
    );

    if (!file) {
      throw new Error(
        'No se recibió ninguna imagen.',
      );
    }

    const imagenUrl =
      `/uploads/services/${file.filename}`;

const imagen =
  await this.servicesService.replaceImage(
    imageId,
    imagenUrl,
    req.user,
  );

    return {
      message:
        'Imagen reemplazada correctamente',
      imagen,
    };
  }

  // ==========================================================
  // ELIMINAR UNA IMAGEN DEL SERVICIO
  // DELETE /services/:id/images/:imageId
  // ==========================================================

  @UseGuards(JwtAuthGuard)
  @Delete(
    ':id/images/:imageId',
  )
async eliminarImagen(
  @Param('id')
  id: string,

  @Param('imageId')
  imageId: string,

  @Req() req: any,
) {
    // Verificar servicio
    await this.servicesService.findOne(
      id,
    );

this.servicesService.removeImage(
  imageId,
  req.user,
);
  }

  // ==========================================================
  // LISTAR SERVICIOS DE UNA EMPRESA
  // GET /services/company/:companyId
  // ==========================================================

  @Get('company/:companyId')
  findByCompany(
    @Param('companyId')
    companyId: string,
  ) {
    return this.servicesService.findByCompany(
      companyId,
    );
  }
// ==========================================================
// BUSCAR SERVICIOS
// GET /services/search?q=PLANOS
// ==========================================================

@Get('search')
search(
  @Query('q') q: string,
) {
  return this.servicesService.search(q);
}
// ==========================================================
// CONTAR SERVICIOS
// GET /services/count
// ==========================================================

@Get('count')
count() {
  return this.servicesService.count();
}
  // ==========================================================
  // OBTENER UN SERVICIO
  // GET /services/:id
  // ==========================================================

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.servicesService.findOne(
      id,
    );
  }

  // ==========================================================
  // ACTUALIZAR SERVICIO
  // PATCH /services/:id
  // ==========================================================

  @UseGuards(JwtAuthGuard)
@Patch(':id')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      nombre: {
        type: 'string',
        example: 'Servicio de prueba ZAPEA EDITADO',
      },
      descripcion: {
        type: 'string',
        example: 'Servicio editado',
      },
      precioDesde: {
        type: 'number',
        example: 150,
      },
      imagenUrl: {
        type: 'string',
        example: '',
      },
      destacado: {
        type: 'boolean',
        example: true,
      },
    },
  },
})
update(
    @Param('id')
    id: string,

    @Body()
    body: {
      nombre?: string;
      descripcion?: string;
      precioDesde?: number;
      imagenUrl?: string;
      destacado?: boolean;
    },

    @Req() req: any,
  ) {
    return this.servicesService.update(
      id,
      body,
      req.user,
    );
  }
  // ==========================================================
  // IMAGEN ÚNICA ANTIGUA
  // Se mantiene para compatibilidad
  // POST /services/:id/image
  // ==========================================================

  @UseGuards(JwtAuthGuard)
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor(
      'imagen',
      {
        storage: diskStorage({
          destination:
            './uploads/services',

          filename: (
            req,
            file,
            callback,
          ) => {
            const extension =
              extname(
                file.originalname,
              );

            const nombreArchivo =
              `${Date.now()}-${Math.round(
                Math.random() * 1e9,
              )}${extension}`;

            callback(
              null,
              nombreArchivo,
            );
          },
        }),
      },
    ),
  )
async subirImagenAntigua(
  @Param('id')
  id: string,

  @UploadedFile()
  file: Express.Multer.File,

  @Req() req: any,
) {
    if (!file) {
      throw new Error(
        'No se recibió ninguna imagen.',
      );
    }

    const servicioActual =
      await this.servicesService.findOne(
        id,
      );

    const imagenAnterior =
      servicioActual.imagenUrl;

    const imagenUrl =
      `/uploads/services/${file.filename}`;

const servicioActualizado =
  await this.servicesService.update(
    id,
    {
      imagenUrl,
    },
    req.user,
  );

    // Eliminar imagen antigua
    if (
      imagenAnterior &&
      imagenAnterior.startsWith(
        '/uploads/services/',
      )
    ) {
      try {
        const nombreImagenAnterior =
          basename(
            imagenAnterior,
          );

        const rutaImagenAnterior =
          join(
            process.cwd(),
            'uploads',
            'services',
            nombreImagenAnterior,
          );

        if (
          existsSync(
            rutaImagenAnterior,
          )
        ) {
          unlinkSync(
            rutaImagenAnterior,
          );
        }
      } catch (error) {
        console.error(
          'No se pudo eliminar imagen anterior:',
          error,
        );
      }
    }

    return {
      message:
        'Imagen reemplazada correctamente',
      imagenUrl,
      servicio:
        servicioActualizado,
    };
  }

  // ==========================================================
  // ELIMINAR SERVICIO
  // DELETE /services/:id
  // ==========================================================

@UseGuards(JwtAuthGuard)
@Delete(':id')
remove(
  @Param('id')
  id: string,

  @Req() req: any,
) {
  return this.servicesService.remove(
    id,
    req.user,
  );
}
}