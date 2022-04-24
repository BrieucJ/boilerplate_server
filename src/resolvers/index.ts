import { default as AuthResolver } from './auth'
import { default as UserResolver } from './user'

export default {
  Query: {
    ...AuthResolver.Query,
    ...UserResolver.Query,
  },
  Mutation: {
    ...AuthResolver.Mutation,
    ...UserResolver.Mutation,
  },
}
