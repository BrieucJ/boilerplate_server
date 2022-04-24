import nodemailer from 'nodemailer'
import { User } from '../entities'
import logger from './logger'
import { FRONTEND_URL } from './config'
import { createToken } from './authentication'
import { TokenType } from './types'

type Mail = {
  from: string
  to: string
  subject: string
  text: string
  html: string
}

const getMailOptions = (user: User, mailType: string): Mail => {
  const options = {
    from: '',
    to: user.email,
    subject: '',
    text: '',
    html: '',
  }

  switch (mailType) {
    case 'confirmEmail': {
      const confirmToken = createToken(TokenType.confirmToken, user)
      options.subject = 'Verification email'
      options.text = `Click here to confirm you email: ${FRONTEND_URL}/account/confirm/${confirmToken}`
      options.html = `<b>Click <a href="${FRONTEND_URL}/account/confirm/${confirmToken}">here</a> to confirm you email</b>`
      break
    }
    case 'forgotPasswordEmail': {
      const forgotToken = createToken(TokenType.forgotToken, user)
      options.subject = 'Reset password email'
      options.text = `Click here to reset your password: ${FRONTEND_URL}/account/reset/${forgotToken}`
      options.html = `<b>Click <a href="${FRONTEND_URL}/account/reset/${forgotToken}">here</a> to reset your password </b>`
      break
    }
    default:
      logger.error('Unknown mail type')
      break
  }
  return options
}

export default async (user: User, mailType: string) => {
  logger.info(`Sending ${mailType} to ${user.email}`)
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  const testAccount = await nodemailer.createTestAccount()
  const mailOptions = getMailOptions(user, mailType)
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  })

  // send mail with defined transport object
  const email = await transporter.sendMail(mailOptions)

  logger.info(`Message sent: ${email.messageId}`)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(email) as string}`)
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
