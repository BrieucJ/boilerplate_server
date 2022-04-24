import { ForbiddenError, AuthenticationError } from 'apollo-server-express'
import { User } from '../entities'
import {
  Context,
  DecodedToken,
  Tokens,
  TokenType,
  LoginInput,
  refreshTokensInput,
  forgotPasswordInput,
  RegisterInput,
  confirmEmailInput,
  changePasswordInput,
} from '../utils/types'
import { comparePassword, createToken, verifyToken } from '../utils/authentication'
import mailer from '../utils/mailer'

export default {
  Query: {
    async login(_parent: any, args: LoginInput, _context: Context, _info: any): Promise<Tokens> {
      const user: User | null = await User.findOne({ where: { email: args.email } })
      if (!user) throw new AuthenticationError('wrong_email_or_password')
      await comparePassword(args.password, user.password)
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async refreshTokens(_parent: any, args: refreshTokensInput, _context: Context, _info: any): Promise<Tokens> {
      const decodedToken: DecodedToken = verifyToken(TokenType.refreshToken, args.refreshToken)
      const user: User | null = await User.findOne({ where: { email: decodedToken.email } })
      if (!user) throw new ForbiddenError('refreshToken_invalid')
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async forgotPassword(_parent: any, args: forgotPasswordInput, _context: Context, _info: any): Promise<string> {
      const user: User | null = await User.findOne({ where: { email: args.email } })
      if (user) await mailer(user, 'forgotPasswordEmail')
      return 'email_sent_if_exist'
    },
  },
  Mutation: {
    async register(_parent: any, args: RegisterInput, _context: Context, _info: any): Promise<Tokens> {
      const user: User = await User.create({
        email: args.email,
        username: args.username,
        password: args.password,
      }).save()
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async confirmEmail(_parent: any, args: confirmEmailInput, _context: Context, _info: any): Promise<Tokens> {
      const decodedToken: DecodedToken = verifyToken(TokenType.confirmToken, args.confirmToken)
      const user: User | null = await User.findOne({ where: { email: decodedToken.email } })
      if (!user) throw new ForbiddenError('confirmToken_invalid')
      user.confirmed = true
      await user.save()
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async changePassword(_parent: any, args: changePasswordInput, _context: Context, _info: any): Promise<Tokens> {
      const decodedToken: DecodedToken = verifyToken(TokenType.forgotToken, args.forgotToken)
      const user: User | null = await User.findOne({ where: { email: decodedToken.email } })
      if (!user) throw new ForbiddenError('forgotToken_invalid')
      user.password = args.password
      await user.save()
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
  },
}
