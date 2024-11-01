import { UserSessionData } from "../../common/interface/session-data.interface";
import { EmployeeData } from "./employee-data.interface";

export interface LoginResponse {
  user: EmployeeData,
  auth: UserSessionData
}