import { SignUpResponseType } from '@libs/business';

export class SignUpResponseDto implements SignUpResponseType {
  id: string = '';
  email: string = '';
  nickName: string = '';
  introduction: string | null = null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
