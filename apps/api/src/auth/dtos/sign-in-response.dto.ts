import { SignInResponseType } from '@libs/business';

export class SignInResponseDto implements SignInResponseType {
  id: string;
  accessToken: string;
  refreshToken: string;
}
