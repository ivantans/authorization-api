import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AccountRoles } from './common/decorator/account-roles/account-roles.decorator';
import { RolesGuard } from './common/guard/roles/roles.guard';

@Controller()
@UseGuards(RolesGuard)
export class AppController {
  constructor(private readonly appService: AppService) { }

  @AccountRoles("CUSTOMER", ["BASIC"])
  @Get("customer-basic")
  getCustomer(): string {
    return "Customer with basic role"
  }

  @AccountRoles("EMPLOYEE", ["SALES"])
  @Get("employee-basic")
  getEmployee() {
    return "Employee with sales role"
  } 

  @Get("/public")
  getPublic(){
    return "public"
  }

  @Get("test-email")
  sendMailer(@Res() response: any) {
    const mail = this.appService.sendMail();
    return response.status(200).json({
      message: 'success',
      mail,
    });
  }
}
