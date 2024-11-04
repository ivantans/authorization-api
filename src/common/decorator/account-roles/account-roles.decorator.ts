import { SetMetadata } from '@nestjs/common';

export const AccountRoles = (accountType: "CUSTOMER" | "EMPLOYEE" | "PUBLIC", roles: string[]) =>
  SetMetadata('account-roles', { accountType, roles });
