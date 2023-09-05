import { HttpException, HttpStatus } from '@nestjs/common'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'
import { ErrorType } from '../../interfaces/enums'

export class CommonException extends HttpException {
  constructor(
    errorType = ErrorType.INTERNAL_SERVER,
    message = ErrorMessage.INTERNAL_SERVER
  ) {
    super(
      {
        errorType: errorType,
        message: message
      },
      HttpStatus.CREATED
    )
  }
}
