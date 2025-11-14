import { PropertyDto } from '@app/common';

export class VerifyResetPasswordResponseDto {
  @PropertyDto()
  isValid: boolean;
}