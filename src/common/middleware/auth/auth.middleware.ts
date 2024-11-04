import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AuthRequestMiddleware } from './interface/auth-request-middleware.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) { }
  async use(req: AuthRequestMiddleware, res: Response, next: () => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const accountType = payload.accountType;

      const user = await this.findUserByTypeAndId(accountType, payload.sub, token);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req.user = {
        id: user.id,
        email: user.email,
        roles: user.roles,
        accountType: accountType,
      };

      return next();
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async findUserByTypeAndId(accountType: string, userId: number, accessToken: string) {
    if (accountType === 'CUSTOMER') {
      const customer = await this.prisma.customer.findUnique({
        where: { id: userId },
        include: {
          customerSession: true,
          customerRoles: {
            include: { role: { select: { name: true } } },
          },
        },
      });
      if (!customer) return null;
      if (customer.customerSession.accessToken !== accessToken) { return null }
      return {
        id: customer.id,
        email: customer.email,
        roles: customer.customerRoles.map(roleItem => roleItem.role.name),
      };
    }

    if (accountType === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findUnique({
        where: { id: userId },
        include: {
          employeeSession: true,
          employeeRoles: {
            include: { role: { select: { name: true } } },
          },
        },
      });
      if (!employee) return null;
      if (employee.employeeSession.accessToken !== accessToken) { return null }

      return {
        id: employee.id,
        email: employee.email,
        roles: employee.employeeRoles.map(roleItem => roleItem.role.name),
      };
    }

    return null;
  }
}
