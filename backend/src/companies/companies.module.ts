import { Module } from '@nestjs/common';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CompanyAccessGuard } from './company-access.guard';
import { CompanyGalleryAccessGuard } from './company-gallery-access.guard';

import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],

  controllers: [CompaniesController],

providers: [
  CompaniesService,
  PrismaService,
  CompanyAccessGuard,
  CompanyGalleryAccessGuard,
],
})
export class CompaniesModule {}