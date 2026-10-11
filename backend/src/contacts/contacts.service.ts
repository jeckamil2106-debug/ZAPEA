import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  // CREAR CONTACTO
  create(data: CreateContactDto) {
    return this.prisma.contact.create({
      data,
    });
  }

  // LISTAR CONTACTOS
  findAll() {
    return this.prisma.contact.findMany({
      orderBy: {
        id: 'desc',
      },
    });
  }

  // BUSCAR CONTACTO POR ID
  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: {
        id,
      },
    });

    if (!contact) {
      throw new NotFoundException(
        `No se encontró el contacto con ID: ${id}`,
      );
    }

    return contact;
  }

  // ACTUALIZAR CONTACTO
  async update(id: string, data: UpdateContactDto) {
    // Primero verificamos que exista
    const contact = await this.prisma.contact.findUnique({
      where: {
        id,
      },
    });

    if (!contact) {
      throw new NotFoundException(
        `No se encontró el contacto con ID: ${id}`,
      );
    }

    // Si existe, lo actualizamos
    return this.prisma.contact.update({
      where: {
        id,
      },
      data,
    });
  }

  // ELIMINAR CONTACTO
  async remove(id: string) {
    // Primero verificamos que exista
    const contact = await this.prisma.contact.findUnique({
      where: {
        id,
      },
    });

    if (!contact) {
      throw new NotFoundException(
        `No se encontró el contacto con ID: ${id}`,
      );
    }

    return this.prisma.contact.delete({
      where: {
        id,
      },
    });
  }
}