import { User } from '../entities'
import jwt from 'jsonwebtoken'
import casual from 'casual'
import { initTestServer, initTestDB } from '../utils/testing'
import { gql } from 'apollo-server-express'

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(email: $email, username: $username, password: $password) {
      accessToken
      refreshToken
    }
  }
`

const LOGIN_QUERY = gql`
  query Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`

const REFRESH_TOKENS_QUERY = gql`
  query refreshTokens($refreshToken: String!) {
    refreshTokens(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`

const FORGOT_PASSWORD_QUERY = gql`
  query forgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`

const CONFIRM_EMAIL_MUTATION = gql`
  mutation ConfirmEmail($confirmToken: String!) {
    confirmEmail(confirmToken: $confirmToken) {
      accessToken
      refreshToken
    }
  }
`

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($password: String!, $forgotToken: String!) {
    changePassword(password: $password, forgotToken: $forgotToken) {
      accessToken
      refreshToken
    }
  }
`

describe('Auth resolver', () => {
  let testServer: any
  let testDB: any
  const testUser = {
    username: casual.username,
    email: casual.email,
    password: casual.password + casual.password, //min length
  }

  beforeAll(async () => {
    testDB = initTestDB()
    await testDB.reset()
    testServer = await initTestServer()
  })

  it('should register a new user and return tokens', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: testUser,
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.register).toHaveProperty('accessToken')
    expect(result.data?.register).toHaveProperty('refreshToken')
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with a null email', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: null,
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('email_cannot_be_empty')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with a null username', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: casual.email,
        username: null,
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('username_cannot_be_empty')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with a null password', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: casual.email,
        password: null,
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('password_cannot_be_empty')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with an undefined email', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: undefined,
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('email_cannot_be_empty')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with an undefined username', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: casual.email,
        username: undefined,
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('username_cannot_be_empty')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with an undefined password', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: casual.email,
        password: undefined,
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('password_cannot_be_empty')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with an empty email', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: '',
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('email_cannot_be_empty')
    expect(result.errors?.[1].message).toBe('email_must_be_an_email')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with an empty username', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: casual.email,
        username: '',
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('username_cannot_be_empty')
    expect(result.errors?.[1].message).toBe('username_must_be_between_3_and_50_characters')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should not register a new user with an empty password', async () => {
    const result = await testServer.execute({
      query: REGISTER_MUTATION,
      variables: {
        ...testUser,
        email: casual.email,
        password: '',
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('password_cannot_be_empty')
    expect(result.errors?.[1].message).toBe('password_must_be_at_least_8_characters')
    expect(result.data).toBe(null)
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
  })

  it('should login a valid user and return tokens', async () => {
    const result = await testServer.execute({
      query: LOGIN_QUERY,
      variables: { email: testUser.email, password: testUser.password },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.login).toHaveProperty('accessToken')
    expect(result.data?.login).toHaveProperty('refreshToken')
  })

  it('should not login a user with wrong password', async () => {
    const result = await testServer.execute({
      query: LOGIN_QUERY,
      variables: { email: testUser.email, password: 'wrongPassword' },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('wrong_email_or_password')
    expect(result.data).toBe(null)
  })

  it('should not login a user with wrong email', async () => {
    const result = await testServer.execute({
      query: LOGIN_QUERY,
      variables: { email: 'wrongemail', password: testUser.password },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('wrong_email_or_password')
    expect(result.data).toBe(null)
  })

  it('should refresh tokens given a valid refreshToken', async () => {
    const testRefreshToken = 'Bearer ' + jwt.sign({ email: testUser.email }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '1d' })
    const result = await testServer.execute({
      query: REFRESH_TOKENS_QUERY,
      variables: { refreshToken: testRefreshToken },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.refreshTokens).toHaveProperty('accessToken')
    expect(result.data?.refreshTokens).toHaveProperty('refreshToken')
  })

  it('should not refresh tokens given an invalid refreshToken', async () => {
    const result = await testServer.execute({
      query: REFRESH_TOKENS_QUERY,
      variables: { refreshToken: 'invalidToken' },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('refreshToken_invalid')
    expect(result.data).toBe(null)
  })

  it('should not refresh tokens given an expired refreshToken', async () => {
    const expiredToken = 'Bearer ' + jwt.sign({ email: testUser.email }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '1' }) //expires in 1ms
    const result = await testServer.execute({
      query: REFRESH_TOKENS_QUERY,
      variables: { refreshToken: expiredToken },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('refreshToken_expired')
    expect(result.data).toBe(null)
  })

  it('should not refresh tokens given a refreshToken with unknown email', async () => {
    const expiredToken = 'Bearer ' + jwt.sign({ email: 'unknown_email' }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '1d' })
    const result = await testServer.execute({
      query: REFRESH_TOKENS_QUERY,
      variables: { refreshToken: expiredToken },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('refreshToken_invalid')
    expect(result.data).toBe(null)
  })

  it('should send back email_sent_if_exist for a valid email', async () => {
    const result = await testServer.execute({
      query: FORGOT_PASSWORD_QUERY,
      variables: { email: testUser.email },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.forgotPassword).toBe('email_sent_if_exist')
  })

  it('should send back email_sent_if_exist for an invalid email', async () => {
    const result = await testServer.execute({
      query: FORGOT_PASSWORD_QUERY,
      variables: { email: 'invalidemail' },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.forgotPassword).toBe('email_sent_if_exist')
  })

  it('should set confirmed to true if token is correct', async () => {
    const confirmToken = 'Bearer ' + jwt.sign({ email: testUser.email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' })
    const result = await testServer.execute({
      query: CONFIRM_EMAIL_MUTATION,
      variables: { confirmToken: confirmToken },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.confirmEmail).toHaveProperty('accessToken')
    expect(result.data?.confirmEmail).toHaveProperty('refreshToken')
    const users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
    expect(users[0].confirmed).toBe(true)
  })

  it('should change password and return tokens', async () => {
    let users = await User.find()
    expect(users.length).toBe(1)
    const oldPassword = users[0].password
    const forgotToken = 'Bearer ' + jwt.sign({ email: testUser.email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' })
    const result = await testServer.execute({
      query: CHANGE_PASSWORD_MUTATION,
      variables: { password: 'NEW_PASSWORD', forgotToken: forgotToken },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.changePassword).toHaveProperty('accessToken')
    expect(result.data?.changePassword).toHaveProperty('refreshToken')
    users = await User.find()
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(testUser.email)
    expect(users[0].username).toBe(testUser.username)
    expect(users[0].password).not.toBe(oldPassword)
  })

  afterAll(async () => {
    await testServer.stop()
    await testDB.stop()
  })
})
