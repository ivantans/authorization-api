import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtConfigModule } from './config/jwt-config/jwt-config.module';

@Module({
  imports: [JwtConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
