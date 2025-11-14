import { PropertyDto } from '@app/common';

export class LoginResponseDto {
  @PropertyDto()
  accessToken?: string;

  @PropertyDto()
  refreshToken?: string;

  @PropertyDto()
  email?: string;

  @PropertyDto()
  success?: boolean;
}