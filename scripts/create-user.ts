/**
 * Creates a user directly in the database, using the same scrypt hashing as
 * src/lib/auth.ts so the row is indistinguishable from one created through the
 * app.
 *
 * Usage: bun run scripts/create-user.ts <email> <name> <password> [role]
 */
import { randomBytes, scryptSync } from "crypto";
import { prisma } from "../src/lib/db-alias";

const SCRYPT_KEYLEN = 64;

/** Mirrors src/lib/auth.ts — the format the login path verifies against. */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const [email, name, password, role = "SUPER_ADMIN"] = process.argv.slice(2);

  if (!email || !name || !password) {
    console.error("Usage: bun run scripts/create-user.ts <email> <name> <password> [role]");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`A user with email "${email}" already exists.`);
    process.exit(1);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      isActive: true,
    },
  });

  console.log(`Created ${role}: ${user.email} (${user.name})`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});