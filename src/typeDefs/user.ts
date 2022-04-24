import { gql } from 'apollo-server-express'

export default gql`
  scalar Date

  type User {
    id: Int!
    username: String!
    email: String!
    confirmed: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type Query {
    me: User
    users: [User]
  }
`
