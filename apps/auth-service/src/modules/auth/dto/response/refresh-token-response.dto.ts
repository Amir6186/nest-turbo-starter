import { PropertyDto } from '@app/common';

export class RefreshTokenResponseDto {
  @PropertyDto()
  accessToken: string;
}