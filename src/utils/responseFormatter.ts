import { ValidationError } from 'apollo-server-express'
import { GraphQLResponse } from 'apollo-server-types'
import { GraphQLFormattedError } from 'graphql'

type Constraint = { [key: string]: string }

export default (response: GraphQLResponse): GraphQLResponse => {
  if (response.errors) {
    response.data = null
    response.errors = response.errors.reduce((acc: GraphQLFormattedError[], error: GraphQLFormattedError): GraphQLFormattedError[] => {
      if (error.message && error.message === 'VALIDATION_ERROR') {
        error = error as ValidationError
        const locations = error.locations
        const path = error.path
        const code = error.extensions?.code as string
        const extensionsErrors = error.extensions?.errors as ValidationError[]
        const errors = extensionsErrors.reduce((acc2: GraphQLFormattedError[], err: ValidationError): GraphQLFormattedError[] => {
          const constraints = err.constraints as Constraint
          Object.keys(constraints).map((key: string) => {
            acc2.push({
              message: constraints[key],
              locations,
              path,
              extensions: {
                code: code,
                constraint: key,
                target: err.target as string,
                value: err.value as string,
                property: err.property as string,
              },
            })
          })
          return acc2
        }, [])
        acc = acc.concat(errors)
      } else {
        acc.push(error)
      }
      return acc
    }, [])
  }
  return response
}
