import { SuccessResponseDto } from '@app/common';
import {
  PropertyDto,
} from '@app/common';
import { IsEmail, IsStrongPassword, Matches, MaxLength } from 'class-validator';

// ****************************** InternalSignUp ******************************
export class SignUpBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'temporary001@email.com',
  })
  @IsEmail()
  @MaxLength(50)
  email: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'Sota@001',
  })
  @MaxLength(50)
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

export class SignUpResponseDto {
  @PropertyDto()
  accessToken: string;

  @PropertyDto()
  refreshToken: string;
}

// ****************************** Login ******************************
export class LoginBodyDto extends SignUpBodyDto {}

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

// ******************************  VerifyEmail ******************************
export class VerifyEmailBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'temporary001@email.com',
  })
  email: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: '9b92c6b1-f124-40e9-abce-66e67854c5f5m',
  })
  token: string;
}

// ******************************  RefreshToken ******************************
export class RefreshTokenResponseDto {
  @PropertyDto()
  accessToken: string;
}

// ****************************** forgotPassword ******************************
export class SendResetPasswordLinkBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'user@example.com',
  })
  @IsEmail()
  @MaxLength(50)
  email: string;
}

export class SendResetPasswordResponseDto {
  @PropertyDto()
  success: boolean;
}

export class VerifyResetPasswordLinkBodyDto extends VerifyEmailBodyDto {}

export class VerifyResetPasswordLinkResponseDto {
  @PropertyDto()
  isValid: boolean;
}

// ****************************** resetPassword ******************************
export class ResetPasswordBodyDto extends VerifyResetPasswordLinkBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'NewPass@123',
  })
  @MaxLength(50)
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @Matches(/^\S*$/, { message: 'Whitespace not allowed' })
  newPassword: string;
}

export class ResetPasswordResponseDto extends SuccessResponseDto {}

// ****************************** Logout ******************************
export class LogoutResponseDto extends SuccessResponseDto {}

// ****************************** changePassword ******************************
export class ChangePasswordBodyDto {
  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'Sota@001',
  })
  @MaxLength(50)
  currentPassword: string;

  @PropertyDto({
    type: String,
    required: true,
    validated: true,
    example: 'Sota@123',
  })
  @MaxLength(50)
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @Matches(/^\S+$/, {
    message: 'Whitespace not allowed',
  })
  newPassword: string;
}

export class ChangePasswordResponseDto extends SuccessResponseDto {}
