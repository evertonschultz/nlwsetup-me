import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'

import { appRoutes } from './routes'

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  })

  await fastify.register(cors, {
    origin: true
  })

  await fastify.register(jwt, {
    secret: process.env.SECRET_JWT!,
  })

  await fastify.register(appRoutes)

  await fastify.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
    console.log('HTTP Server running!')
  })
}

bootstrap()