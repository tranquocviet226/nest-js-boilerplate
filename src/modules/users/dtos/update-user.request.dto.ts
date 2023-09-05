import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  Length,
  Matches,
  MaxLength,
  ValidateIf
} from 'class-validator'
import { regex } from 'src/helpers/regex.helper'

export class UpdateUserRequestDto {
  @ValidateIf((val) => val.fullName)
  @MaxLength(100)
  @ApiProperty({
    example: 'Nguyen Van B'
  })
  fullName: string

  @ValidateIf((val) => val.photoId)
  @ApiProperty({
    example: 1
  })
  photoId: number

  @ValidateIf((val) => val.birthday)
  @IsDateString()
  @ApiProperty({
    example: new Date()
  })
  birthday: Date

  @ValidateIf((val) => val.password)
  @Matches(regex.passwordRegex)
  @Length(6, 20)
  @ApiProperty({
    example: 'Khoqua227'
  })
  password: string
}
