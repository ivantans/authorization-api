import { UserSessionData } from "../../common/interface/session-data.interface";
import { CustomerData } from "./customer-data.interface";

export interface LoginResponse {
  user: CustomerData,
  auth: UserSessionData
}