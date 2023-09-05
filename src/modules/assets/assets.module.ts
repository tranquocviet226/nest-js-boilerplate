import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssetsController } from './assets.controller'
import { AssetsRepository } from './assets.repository'
import { AssetsService } from './assets.service'
import { AssetExistValidator } from '@common/validations/assets/asset.validator'

@Module({
  imports: [TypeOrmModule.forFeature([AssetsRepository])],
  controllers: [AssetsController],
  providers: [AssetsService, AssetExistValidator]
})
export class AssetsModule {}
