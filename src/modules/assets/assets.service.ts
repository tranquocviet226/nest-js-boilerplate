import { CommonException } from '@common/exceptions'
import { MessageResponse } from '@common/interceptors/message.response'
import { Injectable } from '@nestjs/common'
import { Response } from 'express'
import { unlink } from 'fs/promises'
import { ErrorType } from 'src/interfaces/enums'
import { ErrorMessage } from 'src/interfaces/enums/error-message.enum'
import { MessageSuccesses } from 'src/interfaces/message.success'
import { DeletePhotoRequestDto } from './dtos/delete-photo.request.dto'
import { AssetsEntity } from './assets.entity'
import { AssetsMapper } from './assets.mapper'
import { AssetsRepository } from './assets.repository'

@Injectable()
export class AssetsService {
  constructor(private photoRepository: AssetsRepository) {}

  async uploadFile(file: Express.Multer.File): Promise<AssetsEntity> {
    try {
      const filename = file?.filename
      const originalname = file?.originalname
      const type = file?.mimetype
      const photo = AssetsMapper.toCreateEntity(filename, type, originalname)
      await this.photoRepository.save(photo)

      return photo
    } catch (error) {
      throw new CommonException(ErrorType.INTERNAL_SERVER, error.message)
    }
  }

  readFile(fileId: string, res: Response) {
    res.sendFile(fileId, { root: 'files' }, (error) => {
      if (error) {
        return res.end()
      }
    })
  }

  async list(): Promise<AssetsEntity[]> {
    const photos = await this.photoRepository.find()
    return photos
  }

  async delete(request: DeletePhotoRequestDto): Promise<MessageResponse> {
    try {
      await unlink(`files/${request.filename}`)
      await this.photoRepository.delete({ name: request.filename })
      return { message: MessageSuccesses.DELETE_SUCCESS }
    } catch (_error) {
      return new CommonException(ErrorType.NOT_FOUND, ErrorMessage.NOT_FOUND)
    }
  }
}
