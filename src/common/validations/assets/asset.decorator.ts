import { ValidationOptions, registerDecorator } from 'class-validator'
import { AssetExistValidator } from './asset.validator'

export function AssetExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'AssetExistValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: AssetExistValidator
    })
  }
}
