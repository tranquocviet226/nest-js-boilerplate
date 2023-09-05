import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator'
import { regex } from 'src/helpers/regex.helper'

export class ResetPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abc@gmail.com'
  })
  email: string

  @Matches(regex.passwordRegex)
  @Length(6, 20)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Khoqua226'
  })
  newPassword: string
}
