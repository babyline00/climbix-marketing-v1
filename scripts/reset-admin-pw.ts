// Align admin user's passwordHash with current ADMIN_PASSWORD (.env) after
// V1 revert. Mirrors src/lib/auth.ts hashing (scrypt$<saltHex>$<hashHex>,
// keylen 64, 16-byte salt) without importing server-only modules.
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()
const SCRYPT_KEYLEN = 64

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return `scrypt$${salt}$${hash}`
}

async function main() {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) {
    console.error('ADMIN_PASSWORD not set in environment (.env missing?)')
    process.exit(1)
  }
  const updated = await prisma.user.update({
    where: { email: 'admin@climbixmarketing.com' },
    data: { passwordHash: hashPassword(pw), isActive: true },
  })
  console.log(`✓ admin@climbixmarketing.com hash reset (role=${updated.role}, active=${updated.isActive})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
