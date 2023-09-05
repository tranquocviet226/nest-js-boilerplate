import { ConflictException } from '@nestjs/common'
import { ErrorType } from '../../interfaces/enums'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'

export class PermissionExistsException extends ConflictException {
  constructor() {
    super({
      errorType: ErrorType.PERMISSION_EXISTS,
      message: ErrorMessage.PERMISSION_EXISTS
    })
  }
}
