import { ConfigService } from '@nestjs/config'
import { AssetsEntity } from './assets.entity'
import { PhotoResponseDto } from './dtos/photo.response.dto'

export class AssetsMapper {
  public static toDto(
    entity: AssetsEntity,
    configService: ConfigService
  ): PhotoResponseDto {
    const dto = new PhotoResponseDto()
    const { id, name, type, originalname } = entity
    dto.id = id
    dto.name = name
    dto.originalname = originalname
    dto.type = type
    dto.url = `${configService.get('BASE_URL')}/assets/${name}`
    return dto
  }

  public static toCreateEntity(
    name: string,
    type: string,
    originalname: string
  ): AssetsEntity {
    const entity = new AssetsEntity()
    entity.name = name
    entity.originalname = originalname
    entity.type = type
    entity.active = true
    return entity
  }
}
