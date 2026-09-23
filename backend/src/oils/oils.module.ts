import { Module } from '@nestjs/common';
import { OilsService } from './oils.service';
import { OilsController } from './oils.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [OilsController],
  providers: [OilsService, PrismaService],
})
export class OilsModule {}
