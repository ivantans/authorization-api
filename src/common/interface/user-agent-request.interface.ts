import { Request } from "express";

export interface UserAgentRequest extends Request {
  userAgentId: number
}