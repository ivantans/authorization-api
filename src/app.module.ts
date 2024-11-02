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
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './config/mail/mail.module';

@Module({
  imports: [
    JwtConfigModule,
    PrismaModule,
    CustomerAuthModule,
    EmployeeAuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CustomerModule,
    EmployeeModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
