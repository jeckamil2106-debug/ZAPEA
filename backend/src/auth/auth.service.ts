import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {

    const exists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'El correo ya se encuentra registrado',
      );
    }

    const password = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password,
      },
    });

    return {
      message: 'Usuario registrado correctamente',

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
  // ==========================================================
  // CREAR CUENTA EMPRESA
  // SOLO USADA POR ADMIN
  // ==========================================================

async createEmpresa(dto: RegisterDto) {
  const exists = await this.prisma.user.findUnique({
    where: {
      email: dto.email,
    },
  });

  if (exists) {
    throw new BadRequestException(
      'El correo ya se encuentra registrado',
    );
  }

  if (!dto.companyId) {
    throw new BadRequestException(
      'Debe seleccionar una empresa para la cuenta',
    );
  }

  const empresa = await this.prisma.company.findUnique({
    where: {
      id: dto.companyId,
    },
  });

  if (!empresa) {
    throw new NotFoundException(
      'La empresa seleccionada no existe',
    );
  }

  if (empresa.ownerId) {
    throw new ConflictException(
      'La empresa ya tiene una cuenta asignada',
    );
  }

  const password = await bcrypt.hash(
    dto.password,
    10,
  );

  const user = await this.prisma.$transaction(
    async (tx) => {
      const nuevoUsuario = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password,
          role: 'EMPRESA',
        },
      });

      const empresaActualizada =
        await tx.company.updateMany({
          where: {
            id: empresa.id,
            ownerId: null,
          },
          data: {
            ownerId: nuevoUsuario.id,
          },
        });

      if (empresaActualizada.count === 0) {
        throw new ConflictException(
          'La empresa ya tiene una cuenta asignada',
        );
      }

      return nuevoUsuario;
    },
  );

  return {
    message: 'Cuenta de empresa creada correctamente',

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: empresa.id,
    },
  };
}
async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: {
      email: dto.email,
    },
    include: {
      companies: {
        select: {
          id: true,
          nombre: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedException(
      'Credenciales incorrectas',
    );
  }

if (!user.isActive) {
  throw new UnauthorizedException(
    'La cuenta se encuentra desactivada',
  );
}

  const passwordCorrecta = await bcrypt.compare(
    dto.password,
    user.password,
  );

  if (!passwordCorrecta) {
    throw new UnauthorizedException(
      'Credenciales incorrectas',
    );
  }

  const empresaActiva = user.companies[0] ?? null;

  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: empresaActiva?.id ?? null,
  };

  const access_token =
    await this.jwtService.signAsync(payload);

  return {
    message: 'Login correcto',
    access_token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,

      companyId: empresaActiva?.id ?? null,

      company: empresaActiva,

      companies: user.companies,
    },
  };
}

 // ==========================================================
  // LISTAR CUENTAS EMPRESA
  // SOLO ADMIN
  // ==========================================================

  async listarCuentasEmpresa() {
    return this.prisma.user.findMany({
      where: {
        role: 'EMPRESA',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        companies: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

 // ==========================================================
  // ACTIVAR / DESACTIVAR CUENTA EMPRESA
  // SOLO ADMIN
  // ==========================================================

  async cambiarEstadoCuentaEmpresa(
    userId: string,
    isActive: boolean,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || user.role !== 'EMPRESA') {
      throw new NotFoundException(
        'Cuenta de empresa no encontrada',
      );
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

 // ==========================================================
  // SELECCIONAR EMPRESA ACTIVA
  // ==========================================================

  async selectCompany(
    user: {
      sub: string;
      role: string;
    },
    companyId: string,
  ) {
    // ADMIN puede seleccionar cualquier empresa
    if (user.role === 'ADMIN') {
      const company = await this.prisma.company.findUnique({
        where: {
          id: companyId,
        },
        select: {
          id: true,
          nombre: true,
        },
      });

      if (!company) {
        throw new NotFoundException(
          'Empresa no encontrada',
        );
      }

      const payload = {
        sub: user.sub,
        role: user.role,
        companyId: company.id,
      };

      const access_token =
        await this.jwtService.signAsync(payload);

      return {
        message: 'Empresa seleccionada correctamente',
        access_token,
        company,
      };
    }

// EMPRESA solamente puede seleccionar
// una empresa que le pertenece

const company = await this.prisma.company.findUnique({
  where: {
    id: companyId,
  },
  select: {
    id: true,
    nombre: true,
    ownerId: true,
  },
});

if (!company) {
  throw new NotFoundException(
    'La empresa no existe',
  );
}

if (
  user.role === 'EMPRESA' &&
  company.ownerId !== user.sub
) {
  throw new ForbiddenException(
    'La empresa no pertenece al usuario',
  );
}

    const payload = {
      sub: user.sub,
      role: user.role,
      companyId: company.id,
    };

    const access_token =
      await this.jwtService.signAsync(payload);

    return {
      message: 'Empresa seleccionada correctamente',
      access_token,
      company,
    };
  }
}