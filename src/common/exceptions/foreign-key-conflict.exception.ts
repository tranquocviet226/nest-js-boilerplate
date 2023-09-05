import { ConflictException } from '@nestjs/common'
import { ErrorType } from '../../interfaces/enums'

export class ForeignKeyConflictException extends ConflictException {
  constructor() {
    super({
      errorType: ErrorType.FOREIGN_KEY_CONFLICT,
      message: `Foreign key conflict`
    })
  }
}
