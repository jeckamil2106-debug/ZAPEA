import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SucursalService } from './sucursal.service';

import { JwtAuthGuard } from './auth/jwt-auth.guard';

import {
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@Controller()
export class SucursalController {

  constructor(
    private readonly sucursalService: SucursalService,
  ) {}

  // ==========================================================
  // CREAR SUCURSAL
  // ==========================================================
@ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('companies/:companyId/sucursales')
  create(
    @Param('companyId') companyId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.sucursalService.create(
      companyId,
      body,
      req.user,
    );
  }

  // ==========================================================
  // LISTAR SUCURSALES DE UNA EMPRESA
  // ==========================================================
@ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('companies/:companyId/sucursales')
  findAll(
    @Param('companyId') companyId: string,
    @Req() req: any,
  ) {
    return this.sucursalService.findAll(
      companyId,
      req.user,
    );
  }

  // ==========================================================
  // LISTAR SUCURSALES PÚBLICAS
  // ==========================================================

  @Get('companies/:companyId/sucursales/public')
  findAllPublic(
    @Param('companyId') companyId: string,
  ) {
    return this.sucursalService.findAllPublic(
      companyId,
    );
  }

 // ==========================================================
  // LISTAR TODAS LAS SUCURSALES PÚBLICAS
  // ==========================================================

  @Get('sucursales/public')
  findAllPublicas() {
    return this.sucursalService.findAllPublicas();
  }

  // ==========================================================
  // BUSCAR SUCURSAL
  // ==========================================================
@ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('sucursales/:id')
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.sucursalService.findOne(
      id,
      req.user,
    );
  }

  // ==========================================================
  // ACTUALIZAR SUCURSAL
  // ==========================================================
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      nombre: { type: 'string' },
      direccion: { type: 'string' },
      telefono: { type: 'string' },
      whatsapp: { type: 'string' },
      email: { type: 'string' },
      horario: { type: 'string' },
      latitud: { type: 'number' },
      longitud: { type: 'number' },
      activo: { type: 'boolean' },
    },
  },
})
@Patch('sucursales/:id')
update(
  @Param('id') id: string,
  @Body() body: any,
  @Req() req: any,
) {
  console.log('🔎 BODY PATCH SUCURSAL:', body);

  return this.sucursalService.update(
    id,
    body,
    req.user,
  );
}
  // ==========================================================
  // ELIMINAR SUCURSAL
  // ==========================================================
@ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete('sucursales/:id')
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.sucursalService.remove(
      id,
      req.user,
    );
  }
}