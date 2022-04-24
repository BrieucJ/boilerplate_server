import { User } from '../entities'
import { DecodedToken, TokenType, Context } from './types'
import { AuthenticationError, ForbiddenError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 12)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean | void> => {
  const result = await bcrypt.compare(password, hashedPassword)
  if (!result) throw new AuthenticationError('wrong_email_or_password')
  return result
}

export const createToken = (tokenType: TokenType, user: User): string => {
  switch (tokenType) {
    case TokenType.accessToken:
      return 'Bearer ' + jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '30s' })
    case TokenType.refreshToken:
      return 'Bearer ' + jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' })
    case TokenType.confirmToken:
    case TokenType.forgotToken:
      return 'Bearer ' + jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '7d' })
    default:
      throw new Error('Unknow_TokenType')
  }
}

export const verifyToken = (tokenType: TokenType, token: string) => {
  token = token.split(' ')[1]
  try {
    switch (tokenType) {
      case TokenType.accessToken:
      case TokenType.confirmToken:
      case TokenType.forgotToken:
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any as DecodedToken
      case TokenType.refreshToken:
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as any as DecodedToken
      default:
        throw new Error('Unknow_TokenType')
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ForbiddenError(`${TokenType[tokenType]}_expired`)
    } else {
      throw new ForbiddenError(`${TokenType[tokenType]}_invalid`)
    }
  }
}

export const authContext = async (context: Context): Promise<Context> => {
  const accessToken = context.req.headers.authorization || ''
  try {
    const decodedToken = jwt.verify(accessToken.split(' ')[1], process.env.ACCESS_TOKEN_SECRET!) as any as DecodedToken
    const user = await User.findOne({ where: { email: decodedToken.email } })
    if (user === null) return { ...context, user: null }
    return { ...context, user: { id: user.id } }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('accessToken_expired')
    }
    return { ...context, user: null }
  }
}

export const Authenticated = (context: Context): Context => {
  if (context.user === null) throw new ForbiddenError('must_be_logged_in')
  return context
}
