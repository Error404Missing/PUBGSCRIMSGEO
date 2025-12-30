import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { join } from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const envUrl = process.env.DATABASE_URL
const defaultSqlite = `file:${join(process.cwd(), 'dev.db')}`
const dbUrl = envUrl && envUrl.length > 0 ? envUrl : defaultSqlite
process.env.DATABASE_URL = dbUrl

let client: PrismaClient
if (dbUrl.startsWith('libsql:') || process.env.TURSO_DB_URL) {
  const url = process.env.TURSO_DB_URL || dbUrl
  const authToken = process.env.TURSO_DB_AUTH_TOKEN || process.env.TURSO_DB_TOKEN || ''
  const libsql = createClient({ url, authToken })
  const adapter = new PrismaLibSQL(libsql)
  client = globalForPrisma.prisma || new PrismaClient({ adapter })
} else {
  client = globalForPrisma.prisma || new PrismaClient()
}

export const prisma = client

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
