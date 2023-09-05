import { BaseEntity } from '@database/entities'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ schema: 'admin', name: 'assets' })
export class AssetsEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id: number

  @Column({
    name: 'name',
    type: 'varchar'
  })
  name: string

  @Column({
    name: 'originalname',
    type: 'varchar'
  })
  originalname: string

  @Column({
    name: 'type',
    type: 'varchar'
  })
  type: string

  @Column({
    name: 'active',
    type: 'boolean',
    default: true
  })
  active: boolean

  constructor(assets?: Partial<AssetsEntity>) {
    super()
    Object.assign(this, assets)
  }
}
