export interface CustomerData {
  id: number
  email: string
  roles: Role[]
  emailStatus: string,
  createdAt: Date,
  updatedAt: Date,
}

interface Role {
  id: number,
  name: string
}