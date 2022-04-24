import dotenv from 'dotenv'
import path from 'path'
import logger from './logger'

if (!process.env.NODE_ENV) {
  logger.error('process.env.NODE_ENV must be defined')
  process.exit(1)
}
const envPath = process.env.NODE_ENV == 'production' ? path.resolve(process.cwd(), `.env`) : path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
dotenv.config({ path: envPath })

export const API_PATH = '/api/v1'
export const FRONTEND_URL = 'http://localhost:3000'
