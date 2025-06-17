import { SignUpResponseType } from '@libs/business';

export class SignUpResponseDto implements SignUpResponseType {
  id: string;
  email: string;
  nickName: string;
  introduction: string | null;
  createdAt: Date;
  updatedAt: Date;
}
