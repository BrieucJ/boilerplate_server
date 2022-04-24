import { Context } from '../utils/types'
import { User } from '../entities'
import { Authenticated } from '../utils/authentication'

export default {
  Query: {
    async me(_parent: any, _args: any, context: Context, _info: any): Promise<User | null> {
      const ctx: Context = Authenticated(context)
      const user: User | null = await User.findOneBy({ id: ctx.user?.id as number })
      return user
    },
    async users(_parent: any, _args: any, context: Context, _info: any): Promise<User[] | null> {
      Authenticated(context)
      const users: User[] | null = await User.find({})
      return users
    },
  },
  Mutation: {},
}
