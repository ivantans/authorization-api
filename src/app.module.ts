import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtConfigModule } from './config/jwt-config/jwt-config.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { CustomerAuthModule } from './modules/authorization/customer-auth/customer-auth.module';
import { EmployeeAuthModule } from './modules/authorization/employee-auth/employee-auth.module';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from './modules/customer/customer.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerConfigModule } from './config/throttling/throttler-config.module';
import { MailerConfigModule } from './config/mail/mailer-config.module';

@Module({
  imports: [
    JwtConfigModule,
    PrismaModule,
    CustomerAuthModule,
    EmployeeAuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CustomerModule,
    EmployeeModule,
    MailerConfigModule,
    ThrottlerConfigModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
})
export class AppModule { }
