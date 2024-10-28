import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtConfigModule } from './config/jwt-config/jwt-config.module';
import { PrismaModule } from './database/prisma/prisma.module';

@Module({
  imports: [JwtConfigModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
