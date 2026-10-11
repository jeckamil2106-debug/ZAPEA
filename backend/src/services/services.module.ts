import { Module } from '@nestjs/common';

import { ServicesController } from './services.controller';

import { ServicesService } from './services.service';

import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'zapea_super_secret_2026',
    }),
  ],

  controllers: [
    ServicesController,
  ],

  providers: [
    ServicesService,
  ],
})
export class ServicesModule {}