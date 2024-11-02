import { Request } from "express";

export interface AuthRequestMiddleware extends Request{
  user: any
}