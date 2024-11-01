import { EmployeeData } from "./employee-data.interface";
import { SessionData } from "./session-data.interface";

export interface LoginResponse {
  user: EmployeeData,
  auth: SessionData
}