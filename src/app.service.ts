import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  sendMail() {
    const message = `Hello world`;

    this.mailService.sendMail({
      from: 'Kingsley Okure <test123@gmail.com>',
      to: this.configService.get<string>("TO_MAIL"),
      subject: `TEST EMAIL FROM AUTHORIZATION API`,
      text: message,
    });
  }


}
