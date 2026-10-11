import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';

import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}


  @Post('login')
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

 // ==========================================================
  // VERIFICAR SESIÓN ACTIVA
  // ==========================================================

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('session')
  verificarSesion(
    @Req() req: any,
  ) {
    return {
      authenticated: true,
      user: req.user,
    };
  }

  // ==========================================================
  // CREAR CUENTA EMPRESA
  // SOLO ADMIN PUEDE CREAR CUENTAS EMPRESA
  // ==========================================================
@ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('create-empresa')
  createEmpresa(
    @Body() dto: RegisterDto,
    @Req() req: any,
  ) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo un administrador puede crear cuentas de empresa',
      );
    }
    return this.authService.createEmpresa(dto);
  }

    // ==========================================================
  // LISTAR CUENTAS EMPRESA
  // SOLO ADMIN
  // ==========================================================

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('cuentas-empresa')
  listarCuentasEmpresa(
    @Req() req: any,
  ) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo un administrador puede consultar las cuentas de empresa',
      );
    }

    return this.authService.listarCuentasEmpresa();
  }

 // ==========================================================
  // CAMBIAR ESTADO DE CUENTA EMPRESA
  // SOLO ADMIN
  // ==========================================================

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('cuentas-empresa/:userId/estado')
  cambiarEstadoCuentaEmpresa(
    @Param('userId') userId: string,
    @Body('isActive') isActive: boolean,
    @Req() req: any,
  ) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo un administrador puede cambiar el estado de una cuenta',
      );
    }

    return this.authService.cambiarEstadoCuentaEmpresa(
      userId,
      isActive,
    );
  }

  // ==========================================================
  // SELECCIONAR EMPRESA ACTIVA
  // EMPRESA SOLO PUEDE SELECCIONAR UNA EMPRESA PROPIA
  // ADMIN PUEDE SELECCIONAR CUALQUIER EMPRESA
  // ==========================================================
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('select-company/:companyId')
  selectCompany(
    @Param('companyId') companyId: string,
    @Req() req: any,
  ) {
    return this.authService.selectCompany(
      req.user,
      companyId,
    );
  }
}