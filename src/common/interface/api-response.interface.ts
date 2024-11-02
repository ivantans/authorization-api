export interface ApiResponse<T> {
  statusCode: number,
  statusMessage: string,
  message: string
  data?: T
}