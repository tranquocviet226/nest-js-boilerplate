import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
  ValidateIf
} from 'class-validator'
import { regex } from 'src/helpers/regex.helper'

export class UpdateUserIdRequestDto {
  @ValidateIf((val) => val.fullName || val.fullName === '')
  @MaxLength(100)
  @ApiProperty({
    example: 'Nguyen Van B'
  })
  fullName: string

  @ValidateIf((val) => val.photoId || val.photoId === '')
  @ApiProperty({
    example: 1
  })
  photoId: number

  @ValidateIf((val) => val.birthday || val.birthday === '')
  @IsDateString()
  @ApiProperty({
    example: new Date()
  })
  birthday: Date

  @ValidateIf((val) => val.phone || val.phone === '')
  @Matches(regex.phoneRegex)
  @IsNotEmpty()
  @ApiProperty({
    example: '0346718110'
  })
  phone: string

  @ValidateIf((val) => val.email || val.email === '')
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abc@gmail.com'
  })
  email: string

  @ValidateIf((val) => val.password || val.password === '')
  @Matches(regex.passwordRegex)
  @Length(6, 20)
  @ApiProperty({
    example: 'Khoqua227'
  })
  password: string

  @ValidateIf((val) => val.status || val.status === '')
  @Matches(regex.statusRegex)
  @ApiProperty({
    example: 'block'
  })
  status: string
}
