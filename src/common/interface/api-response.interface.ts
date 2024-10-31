export interface ApiResponse<T> {
  messageCode: number,
  messageStatus: string,
  message: string
  data: T
}