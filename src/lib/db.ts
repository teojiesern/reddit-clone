import { PrismaClient } from '@prisma/client'
import "server-only"

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient
}

// if in production, we would create a new prisma client for each request because if not, say there are 100 users on our website making one request each, that is 100 request that all will need the same prisma client to handle which will cause performance issues and might cause inteferences, therefore in production we create a new prisma client for each request and this does not affect the performance because the prisma client will only exist for the duration of that specific request, it is then released and disposed by the server
let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  prisma = global.cachedPrisma
}

export const db = prisma