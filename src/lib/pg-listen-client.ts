import pg from 'pg'

/**
 * LISTEN requires a persistent connection to Postgres.
 * Prefer DIRECT_URL when DATABASE_URL points at a pooler (e.g. PgBouncer transaction mode).
 */
export function getListenConnectionString() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

  if (!url) {
    throw new Error('DATABASE_URL is not configured')
  }

  return url
}

/**
 * New `pg.Client` for NOTIFY / LISTEN (not pooled with Prisma).
 * Caller must connect, then `LISTEN`, then `UNLISTEN` + `end()` on teardown.
 */
export function createListenClient() {
  const raw = getListenConnectionString()
  const parsed = new URL(raw)

  parsed.searchParams.delete('sslmode')
  parsed.searchParams.delete('sslcert')
  parsed.searchParams.delete('sslkey')
  parsed.searchParams.delete('sslrootcert')

  return new pg.Client({
    connectionString: parsed.toString(),
    ssl: { rejectUnauthorized: false },
  })
}
