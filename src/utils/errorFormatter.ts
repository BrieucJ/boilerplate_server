import { GraphQLError, GraphQLFormattedError } from 'graphql'

export default (error: GraphQLError): GraphQLFormattedError => {
  if (error.message.startsWith('Variable "$email"')) {
    error.message = 'email_cannot_be_empty'
  }
  if (error.message.startsWith('Variable "$username"')) {
    error.message = 'username_cannot_be_empty'
  }
  if (error.message.startsWith('Variable "$password"')) {
    error.message = 'password_cannot_be_empty'
  }
  return error
}
