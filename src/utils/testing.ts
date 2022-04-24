import './config'
import { API_PATH } from './config'
import resolvers from '../resolvers'
import typeDefs from '../typeDefs'
import errorFormatter from './errorFormatter'
import responseFormatter from './responseFormatter'
import { authContext } from './authentication'
import { ApolloServer } from 'apollo-server-express'
import fetch from 'cross-fetch'
import { HttpLink } from 'apollo-link-http'
import { execute, toPromise } from 'apollo-link'
import express from 'express'
import source from './source'
import { ExecuteArguments } from './types'

export const initTestServer = async () => {
  const app = express()
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: errorFormatter,
    formatResponse: responseFormatter,
    context: async (context) => {
      const authCtx = await authContext(context)
      return { ...authCtx, ...context }
    },
  })
  await server.start()
  server.applyMiddleware({ app, path: API_PATH })
  const httpServer = app.listen(process.env.PORT!)

  const link = new HttpLink({
    fetch,
    uri: `http://localhost:${process.env.PORT!}${API_PATH}`,
  })

  const executeOperation = async ({ query, variables = {}, context }: ExecuteArguments) => {
    return await toPromise(execute(link, { query, variables, context }))
  }

  const testServer = {
    stop: () => httpServer.close(),
    execute: executeOperation,
  }
  return testServer
}

export const initTestDB = () => {
  const resetDB = async () => {
    await source.initialize()
    await source.dropDatabase()
    await source.synchronize()
  }
  return {
    reset: resetDB,
    stop: () => source.destroy(),
  }
}
