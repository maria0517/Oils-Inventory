import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { OilsModule } from './oils/oils.module';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [AuthModule, OilsModule],
  controllers: [
    AppController,
    AdminController,
  ],
  providers: [
    AppService,
    PrismaService,
    AdminService,
  ],
})
export class AppModule {}
