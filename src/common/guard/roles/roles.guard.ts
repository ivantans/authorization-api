import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequestMiddleware } from 'src/common/middleware/auth/interface/auth-request-middleware.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }
  canActivate(context: ExecutionContext): boolean {
    try {
      console.log(context.getClass())
      console.log(context.getHandler())
      console.log(context)
      const accountRoles = this.reflector.get<{ accountType: string; roles: string[] }>(
        "account-roles",
        context.getHandler(),
      ) || this.reflector.get<{ accountType: string; roles: string[] }>("account-roles", context.getClass());

      // Jika tidak ada metadata accountRoles, akses diizinkan
      if (!accountRoles) {
        return true;
      }

      const { accountType, roles: requiredRoles } = accountRoles;
      const request = context.switchToHttp().getRequest<AuthRequestMiddleware>();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
      if(accountType === "PUBLIC" && requiredRoles.some(role => user.roles.includes(role))){
        return true
      }
      // Cek apakah tipe akun dan peran pengguna cocok dengan accountRoles yang dibutuhkan
      if (user.accountType !== accountType || !requiredRoles.some(role => user.roles.includes(role))) {
        throw new ForbiddenException('Insufficient permissions');
      }

      return true; // Akses diizinkan jika semua kondisi terpenuhi
    } catch (e) {
      console.log(e);
      return false;
    }
  }

}