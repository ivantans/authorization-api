import { Controller, Post, UnauthorizedException } from '@nestjs/common';

@Controller('employee-auth')
export class EmployeeAuthController {
  @Post("/login")
  async login(){
    try{
      
    } catch(e){
      throw e
    }
  }
}
