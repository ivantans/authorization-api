import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccountRoles } from 'src/common/decorator/account-roles/account-roles.decorator';
import { RolesGuard } from 'src/common/guard/roles/roles.guard';

@Controller({
  path: "customer",
  version: "1"
})
export class CustomerController {
  @UseGuards(RolesGuard)
  @AccountRoles("CUSTOMER", ["BASIC", "PREMIUM_CUSTOMER"])
  @Get()
  async get(){
    try{
      return "hello world"
    } catch(e){
      console.log(e)
      throw e
    }
  }
}
