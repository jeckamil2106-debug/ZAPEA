import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyAccessGuard } from './company-access.guard';
import { CompanyGalleryAccessGuard } from './company-gallery-access.guard';
@Controller('companies')
@ApiBearerAuth('access-token')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  // ==========================================================
  // CREAR EMPRESA
  // ==========================================================
@UseGuards(JwtAuthGuard)
@Post()
create(
  @Body() createCompanyDto: CreateCompanyDto,
  @Req() req: any,
) {
  return this.companiesService.create(
    createCompanyDto,
    req.user,
  );
}
  // ==========================================================
  // LISTAR EMPRESAS
  // ==========================================================

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }
// ==========================================================
// MIS EMPRESAS
// ==========================================================

@UseGuards(JwtAuthGuard)
@Get('mis-empresas')
findMyCompanies(
  @Req() req: any,
) {
  return this.companiesService.findMyCompanies(
    req.user,
  );
}
  // ==========================================================
  // BUSCAR UNA EMPRESA
  // ==========================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.companiesService.findOne(id);
  }

  // ==========================================================
  // ACTUALIZAR EMPRESA
  // ==========================================================
@UseGuards(JwtAuthGuard)
@Patch(':id')
async update(
  @Param('id') id: string,
  @Body() updateCompanyDto: UpdateCompanyDto,
  @Req() req: any,
) {
  await this.companiesService.verificarAccesoEmpresa(
    id,
    req.user,
  );

return this.companiesService.update(
  id,
  updateCompanyDto,
  req.user,
);
}

  // ==========================================================
  // ELIMINAR EMPRESA
  // ==========================================================

@UseGuards(JwtAuthGuard)
@Delete(':id')
async remove(
  @Param('id') id: string,
  @Req() req: any,
) {
  await this.companiesService.verificarAccesoEmpresa(
    id,
    req.user,
  );

return this.companiesService.remove(
  id,
  req.user,
);
}

  // ==========================================================
  // SUBIR LOGO Y PORTADA
  // ==========================================================

@UseGuards(
  JwtAuthGuard,
  CompanyAccessGuard,
)
@Post(':id/images')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      logo: {
        type: 'string',
        format: 'binary',
      },
      portada: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'logo',
          maxCount: 1,
        },
        {
          name: 'portada',
          maxCount: 1,
        },
      ],
      {
        storage: diskStorage({
          destination: './uploads/companies',

          filename: (
            req,
            file,
            callback,
          ) => {
            const extensionesPermitidas: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const extension =
  extensionesPermitidas[file.mimetype] || '.jpg';

            const nombreArchivo =
              `${Date.now()}-${Math.round(
                Math.random() * 1e9,
              )}` + extension;

            callback(
              null,
              nombreArchivo,
            );
          },
        }),

        fileFilter: (
          req,
          file,
          callback,
        ) => {
          const tiposPermitidos = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
          ];

          if (
            tiposPermitidos.includes(
              file.mimetype,
            )
          ) {
            callback(null, true);
          } else {
            callback(
              new Error(
                'Solo se permiten imágenes JPG, PNG o WEBP',
              ),
              false,
            );
          }
        },

        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      },
    ),
  )
async uploadImages(
  @Param('id') id: string,
  @UploadedFiles()
  files: {
    logo?: Express.Multer.File[];
    portada?: Express.Multer.File[];
  },
  @Req() req: any,
) {
await this.companiesService.verificarAccesoEmpresa(
  id,
  req.user,
);
    await this.companiesService.findOne(id);

    const logoUrl =
      files.logo?.[0]
        ? `/uploads/companies/${files.logo[0].filename}`
        : undefined;

    const portadaUrl =
      files.portada?.[0]
        ? `/uploads/companies/${files.portada[0].filename}`
        : undefined;

return this.companiesService.updateImages(
  id,
  req.user,
  logoUrl,
  portadaUrl,
);
  }

  // ==========================================================
  // OBTENER GALERÍA DE UNA EMPRESA
  // ==========================================================

  @Get(':id/gallery')
  getGallery(
    @Param('id') id: string,
  ) {
    return this.companiesService.getGallery(id);
  }

  // ==========================================================
  // SUBIR IMÁGENES A LA GALERÍA
  // ==========================================================

@UseGuards(
  JwtAuthGuard,
  CompanyAccessGuard,
)
@ApiBearerAuth('access-token')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
})
@Post(':id/gallery')
@UseInterceptors(
    FilesInterceptor(
      'files',
      10,
      {
        storage: diskStorage({
          destination: './uploads/companies',

          filename: (
            req,
            file,
            callback,
          ) => {
            const extensionesPermitidas: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const extension =
  extensionesPermitidas[file.mimetype] || '.jpg';

            const nombreArchivo =
              `gallery-${Date.now()}-${Math.round(
                Math.random() * 1e9,
              )}` + extension;

            callback(
              null,
              nombreArchivo,
            );
          },
        }),

        fileFilter: (
          req,
          file,
          callback,
        ) => {
          const tiposPermitidos = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
          ];

          if (
            tiposPermitidos.includes(
              file.mimetype,
            )
          ) {
            callback(null, true);
          } else {
            callback(
              new Error(
                'Solo se permiten imágenes JPG, PNG o WEBP',
              ),
              false,
            );
          }
        },

        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      },
    ),
  )
async uploadGallery(
  @Param('id') id: string,
  @UploadedFiles()
  files: Express.Multer.File[],
  @Req() req: any,
) {
  await this.companiesService.verificarAccesoEmpresa(
    id,
    req.user,
  );

  await this.companiesService.findOne(id);

  const imagenes: any[] = [];

  for (const file of files) {
    const imageUrl =
      `/uploads/companies/${file.filename}`;

const imagen =
  await this.companiesService.addGalleryImage(
    id,
    imageUrl,
    req.user,
  );

    imagenes.push(imagen);
  }

  return {
    message: 'Imágenes agregadas correctamente',
    cantidad: imagenes.length,
    imagenes,
  };
}

  // ============================================================
// REEMPLAZAR TODA LA GALERÍA
// ============================================================

@UseGuards(
  JwtAuthGuard,
  CompanyAccessGuard,
)
@Put(':id/gallery/replace')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
})
@UseInterceptors(
  FilesInterceptor(
    'files',
    10,
    {
      storage: diskStorage({
        destination: './uploads/companies',

        filename: (
          req,
          file,
          callback,
        ) => {
          const extensionesPermitidas: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const extension =
  extensionesPermitidas[file.mimetype] || '.jpg';

          const nombreArchivo =
            `gallery-${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}` + extension;

          callback(
            null,
            nombreArchivo,
          );
        },
      }),

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        const tiposPermitidos = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];

        if (
          tiposPermitidos.includes(
            file.mimetype,
          )
        ) {
          callback(null, true);
        } else {
          callback(
            new Error(
              'Solo se permiten imágenes JPG, PNG y WEBP',
            ),
            false,
          );
        }
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    },
  ),
)
async replaceGallery(
  @Param('id') id: string,
  @UploadedFiles()
  files: Express.Multer.File[],
  @Req() req: any,
) {
  await this.companiesService.verificarAccesoEmpresa(
    id,
    req.user,
  );

  await this.companiesService.findOne(id);

  const imageUrls = files.map(
    (file) =>
      `/uploads/companies/${file.filename}`,
  );

const imagenes =
  await this.companiesService.replaceGalleryImages(
    id,
    imageUrls,
    req.user,
  );

  return {
    message:
      'Galería reemplazada correctamente',
    cantidad: imagenes.length,
    imagenes,
  };
}
// ============================================================
// REEMPLAZAR UNA SOLA IMAGEN DE LA GALERÍA
// ============================================================

@UseGuards(
  JwtAuthGuard,
  CompanyGalleryAccessGuard,
)
@Put('gallery/:imageId/replace')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
})
@UseInterceptors(
  FilesInterceptor(
    'files',
    1,
    {
      storage: diskStorage({
        destination: './uploads/companies',

        filename: (
          req,
          file,
          callback,
        ) => {
          const extensionesPermitidas: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const extension =
  extensionesPermitidas[file.mimetype] || '.jpg';

          const nombreArchivo =
            `gallery-${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}` + extension;

          callback(
            null,
            nombreArchivo,
          );
        },
      }),

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        const tiposPermitidos = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];

        if (
          tiposPermitidos.includes(
            file.mimetype,
          )
        ) {
          callback(null, true);
        } else {
          callback(
            new Error(
              'Solo se permiten imágenes JPG, PNG y WEBP',
            ),
            false,
          );
        }
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    },
  ),
)
async replaceGalleryImage(
  @Param('imageId') imageId: string,
  @UploadedFiles()
  files: Express.Multer.File[],
  @Req() req: any,
) {
  if (!files || files.length === 0) {
    throw new Error(
      'Debe seleccionar una imagen nueva',
    );
  }

  const imageUrl =
    `/uploads/companies/${files[0].filename}`;

const imagen =
  await this.companiesService.replaceGalleryImage(
    imageId,
    imageUrl,
    req.user,
  );

  return {
    message:
      'Imagen reemplazada correctamente',
    imagen,
  };
}
  // ==========================================================
  // ELIMINAR IMAGEN DE LA GALERÍA
  // ==========================================================

@UseGuards(
  JwtAuthGuard,
  CompanyGalleryAccessGuard,
)
@Delete('gallery/:imageId')
removeGalleryImage(
  @Param('imageId') imageId: string,
  @Req() req: any,
) {
  return this.companiesService.removeGalleryImage(
    imageId,
    req.user,
  );
}
}