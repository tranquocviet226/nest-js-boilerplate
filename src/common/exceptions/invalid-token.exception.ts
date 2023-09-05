import { ErrorType } from 'src/interfaces/enums'
import { UnauthorizedException } from '@nestjs/common'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super({
      errorType: ErrorType.INVALID_TOKEN,
      message: ErrorMessage.INVALID_TOKEN
    })
  }
}
