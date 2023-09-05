import { MessageResponse } from '@common/interceptors/message.response'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { MulterError, diskStorage } from 'multer'
import { extname } from 'path'
import { EPermissions } from 'src/interfaces/enums/permissions.enum'
import {
  JwtAuthGuard,
  Permissions,
  PermissionsGuard,
  TOKEN_NAME
} from 'src/modules/auth'
import { AssetsEntity } from './assets.entity'
import { AssetsService } from './assets.service'
import { DeletePhotoRequestDto } from './dtos/delete-photo.request.dto'

@ApiTags('Assets Controller')
@ApiBearerAuth(TOKEN_NAME)
@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(EPermissions.ADMIN_ROOT)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (
          file.originalname
            .toLowerCase()
            .match(/^.*\.(jpg|webp|png|jpeg|svg|gif)$/)
        )
          cb(null, true)
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'file'), false)
        }
      },
      limits: { fileSize: 1024 * 1024 * 5 },
      storage: diskStorage({
        destination: './files',
        filename: (_req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          cb(null, `${randomName}${extname(file?.originalname)}`)
        }
      })
    })
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.assetsService.uploadFile(file)
  }

  @Get(':fileId')
  get(@Param('fileId') fileId, @Res() res) {
    return this.assetsService.readFile(fileId, res)
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  list(): Promise<AssetsEntity[]> {
    return this.assetsService.list()
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete()
  delete(@Body() request: DeletePhotoRequestDto): Promise<MessageResponse> {
    return this.assetsService.delete(request)
  }
}
