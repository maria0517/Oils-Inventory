import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OilsModule } from './oils/oils.module';

@Module({
  imports: [OilsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
