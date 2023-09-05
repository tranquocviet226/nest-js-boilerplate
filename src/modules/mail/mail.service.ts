import { vndFormatter } from '@common/functions'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserEntity } from '../users/entities/user.entity'

interface IOrder {
  orderId: number
  status: string
  phone: string
  total: number
}

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async sendMailConfirmation(user: UserEntity, token: string) {
    const MAIL_PATH = this.configService.get('MAIL_PATH')
    const url = `${MAIL_PATH}${token}`

    await this.mailerService.sendMail({
      to: user?.email,
      from: '"Tibe" <varum.technology@gmail.com>',
      subject: 'Xác thực Email',
      template: './mail-confirm', // `.hbs` extension is appended automatically
      context: {
        name: user.fullName,
        url: url
      }
    })
  }

  async sendMailResetPassword(user: UserEntity, emailCode: number | string) {
    await this.mailerService.sendMail({
      from: '"Tibe" <varum.technology@gmail.com>',
      to: user?.email,
      subject: 'Thay đổi mật khẩu',
      template: './mail-reset-password',
      context: {
        name: user.fullName,
        emailCode: emailCode
      }
    })
  }

  async sendMailOrderSuccess(email: string, order: IOrder) {
    try {
      const { orderId, status, phone, total } = order
      const url = `${this.configService.get('WEB_URL')}/order?id=${orderId}`
      await this.mailerService.sendMail({
        from: '"Tibe" <varum.technology@gmail.com>',
        to: email,
        subject: 'Đặt hàng thành công',
        template: './order-success',
        context: {
          orderId,
          status,
          email,
          phone,
          total: vndFormatter(total),
          url
        }
      })
    } catch (error) {
      console.log('SEND MAIL ORDER', error)
    }
  }

  async sendMailSourceCode(email: string, urls: string[]) {
    try {
      await this.mailerService.sendMail({
        from: '"Tibe" <varum.technology@gmail.com>',
        to: email,
        subject: 'Source Code - Tibe',
        template: './source-code',
        context: {
          email,
          urls
        }
      })
    } catch (error) {
      console.log('SEND MAIL SOURCE CODE', error)
    }
  }
}
