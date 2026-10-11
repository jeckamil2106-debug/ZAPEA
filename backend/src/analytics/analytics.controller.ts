import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { ApiBody, ApiTags } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analítica')
@ApiBearerAuth('access-token')
@Controller('analytics')
export class AnalyticsController {

  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('event')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          example: 'PROFILE_VIEW',
        },
companyId: {
  type: 'string',
  example: 'cmxxxxxxxxxxxx',
},
sucursalId: {
  type: 'string',
  example: 'cmxxxxxxxxxxxx',
},
serviceId: {
          type: 'string',
          example: 'cmxxxxxxxxxxxx',
        },
        visitorId: {
          type: 'string',
          example: 'visitor-xxxxxxxxxxxx',
        },
      },
      required: ['type', 'companyId'],
    },
  })
  async registrarEvento(
    @Body()
body: {
  type: string;
  companyId: string;
  sucursalId?: string;
  serviceId?: string;
  visitorId?: string;
},
  ) {
return this.analyticsService.registrarEvento(
  body.type,
  body.companyId,
  body.sucursalId,
  body.serviceId,
  body.visitorId,
);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/:companyId')
async obtenerEstadisticas(
  @Param('companyId') companyId: string,
  @Req() req: any,
) {
  if (
    req.user?.role === 'EMPRESA' &&
    String(req.user.companyId) !== String(companyId)
  ) {
    throw new ForbiddenException(
      'No tienes permiso para ver las estadísticas de esta empresa',
    );
  }

  return this.analyticsService.obtenerEstadisticas(
    companyId,
  );
}

@UseGuards(JwtAuthGuard)
@Get()
async obtenerEstadisticasGlobales(
  @Req() req: any,
  @Query('period') period?: string,
) {
  // EMPRESA → solamente sus propias estadísticas
  if (
    req.user?.role === 'EMPRESA' &&
    req.user?.companyId
  ) {
    return this.analyticsService.obtenerEstadisticas(
      String(req.user.companyId),
    );
  }

  // ADMIN → estadísticas globales de ZAPEA
  return this.analyticsService.obtenerEstadisticasGlobales(
    period,
  );
}
}