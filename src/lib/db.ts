import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getRuntimeDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  const url = new URL(databaseUrl)

  // `pg` gives ssl-related query params precedence over the ssl object,
  // so remove them here and rely on the explicit ssl config below.
  url.searchParams.delete('sslmode')
  url.searchParams.delete('sslcert')
  url.searchParams.delete('sslkey')
  url.searchParams.delete('sslrootcert')

  return url.toString()
}

const pool = new pg.Pool({
  connectionString: getRuntimeDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}