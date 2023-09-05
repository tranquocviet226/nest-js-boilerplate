import { UnauthorizedException } from '@nestjs/common'
import { ErrorType } from '../../interfaces/enums'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'

export class RefreshTokenExpiredException extends UnauthorizedException {
  constructor() {
    super({
      errorType: ErrorType.REFRESH_TOKEN_EXPIRED,
      message: ErrorMessage.REFRESH_TOKEN_EXPIRED
    })
  }
}
