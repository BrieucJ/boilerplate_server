import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  silent: process.env.NODE_ENV === 'test',
  format: winston.format.json(),
  defaultMeta: {
    service: 'server',
    timestamp: new Date(),
  },
  transports: [
    new winston.transports.Console({ format: winston.format.cli() }),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

export default logger
