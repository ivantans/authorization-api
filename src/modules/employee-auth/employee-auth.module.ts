import { Module } from '@nestjs/common';
import { JwtConfigModule } from 'src/config/jwt-config/jwt-config.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { EmployeeAuthService } from './employee-auth.service';
import { EmployeeAuthController } from './employee-auth.controller';

@Module({
  imports: [PrismaModule, JwtConfigModule],
  providers: [EmployeeAuthService],
  controllers: [EmployeeAuthController]
})
export class EmployeeAuthModule {}
