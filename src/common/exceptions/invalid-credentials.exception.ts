import { UnauthorizedException } from '@nestjs/common'
import { ErrorType } from '../../interfaces/enums'

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      errorType: ErrorType.INVALID_CREDENTIALS,
      message: 'Invalid credentials'
    })
  }
}
