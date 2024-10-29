import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class UserAgentMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) { }
  async use(req: Request, res: Response, next: () => void) {
    try {
      const uaParser = new UAParser()
      const uaResult = uaParser.setUA(req.headers['user-agent']).getUA();
      const ua = await this.prisma.userAgent.upsert({
        where: { ua: uaResult },
        update: {},
        create: { ua: uaResult }
      })
      req['userAgentId'] = ua.id;
      next();
    } catch (e) {
      throw e
    }
  }
}
