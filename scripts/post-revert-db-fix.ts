// Clean _prisma_migrations row for 001_qa_schema_drift (migration file removed
// by V1 revert; DB schema itself remains a superset of V1 schema — extra
// tables/columns are tolerated by the V1 Prisma client).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const applied = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
    'SELECT migration_name FROM _prisma_migrations'
  )
  console.log('applied migrations:', applied.map((r) => r.migration_name).join(', '))

  await prisma.$executeRawUnsafe(
    "DELETE FROM _prisma_migrations WHERE migration_name = '001_qa_schema_drift'"
  )
  console.log('✓ removed 001_qa_schema_drift row (file no longer exists after V1 revert)')

  const after = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
    'SELECT migration_name FROM _prisma_migrations'
  )
  console.log('remaining:', after.map((r) => r.migration_name).join(', ') || '(none)')

  // Sanity: extra V2 tables/columns present in DB are tolerated (superset).
  const users = await prisma.user.count()
  const sections = await prisma.homePageSection.count()
  const settings = await prisma.setting.count()
  console.log(`users=${users} homeSections=${sections} settings=${settings}`)
  if (users < 1 || sections < 1) {
    console.error('✗ DB missing core data — reseed needed')
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
