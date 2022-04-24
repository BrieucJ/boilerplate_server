import 'reflect-metadata'
import './utils/config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { API_PATH } from './utils/config'
import logger from './utils/logger'
import source from './utils/source'
import resolvers from './resolvers'
import typeDefs from './typeDefs'
import { Context } from './utils/types'
import { authContext } from './utils/authentication'
import errorFormatter from './utils/errorFormatter'
import responseFormatter from './utils/responseFormatter'

const main = async (): Promise<void> => {
  await source.initialize()
  logger.info('Datasource initialized')
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async (context: Context) => {
      return await authContext(context)
    },
    formatError: errorFormatter,
    formatResponse: responseFormatter,
  })

  await server.start()

  const app = express()
  server.applyMiddleware({ app, path: API_PATH })
  app.listen(process.env.PORT, () => {
    logger.info(`🚀 Server started on localhost:${process.env.PORT!}${API_PATH}`)
  })
}

main().catch((error) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  logger.error('Main function error', { error })
  process.exit(1)
})
