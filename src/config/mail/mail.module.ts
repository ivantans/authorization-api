import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("EMAIL_HOST"),
          auth: {
            user: configService.get<string>("EMAIL_USERNAME"),
            pass: configService.get<string>("EMAIL_PASSWORD")
          }
        }
      }),
      inject: [ConfigService]
    }),
  ],
  exports: [MailerModule]
})
export class MailModule { }
