import { ApiProperty } from '@nestjs/swagger'
import {
  IsAlphanumeric,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
  ValidateIf
} from 'class-validator'
import { regex } from 'src/helpers/regex.helper'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'

export class CreateUserRequestDto {
  @MaxLength(100, { message: ErrorMessage.FULL_NAME_MAX_LENGTH })
  @IsNotEmpty()
  @ApiProperty({
    example: 'Nguyen Van A'
  })
  fullName: string

  @ApiProperty({
    example: 1
  })
  photoId: number

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: new Date()
  })
  birthday: Date

  @ValidateIf((val) => val.phone)
  @Matches(regex.phoneRegex)
  @ApiProperty({
    example: '0346718111'
  })
  phone: string

  @ValidateIf((val) => val.email)
  @IsEmail()
  @ApiProperty({
    example: 'nguyenvana@mailinator.com'
  })
  email: string

  @IsAlphanumeric()
  @IsNotEmpty()
  @ApiProperty({
    example: 'nguyenvana'
  })
  username: string

  @Matches(regex.passwordRegex)
  @Length(6, 20)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Khoqua226'
  })
  password: string
}
