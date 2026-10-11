import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CompaniesModule } from './companies/companies.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServicesModule } from './services/services.module';
import { AnalyticsModule } from './analytics/analytics.module';

import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ContactsModule,
    CompaniesModule,
    ServicesModule,
    AnalyticsModule,
  ],

  controllers: [
    AppController,
    SucursalController,
  ],

  providers: [
    AppService,
    SucursalService,
  ],
})
export class AppModule {}