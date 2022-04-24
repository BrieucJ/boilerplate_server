import { DataSource } from 'typeorm'
import { User } from '../entities'

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  logging: false,
  synchronize: true,
  dropSchema: false,
  entities: [User],
})
