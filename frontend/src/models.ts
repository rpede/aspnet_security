export interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string;
}

export class ResponseDto<T> {
  responseData?: T;
  messageToClient?: string;
}
