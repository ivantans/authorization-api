export interface EmployeeData {
  id: number,
  email: string,
  createdAt: Date,
  updatedAt: Date,
  roles: Roles[]
}

interface Roles {
  id: number,
  name: string
}