/**
 * Prisma error helpers.
 *
 * Shared rather than duplicated per route: both the service slug and the lead
 * email hit a unique constraint, and each needs the same "is this a collision"
 * question answered consistently.
 */

/**
 * True when the error is Prisma's unique-constraint violation (P2002).
 *
 * A P2002 means the write was rejected because a unique index already holds
 * that value. It is a conflict, not a server fault, so callers should answer
 * 409 or handle the existing row rather than returning 500.
 */
export function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" && e !== null && (e as { code?: unknown }).code === "P2002"
  );
}

/** The fields named in a P2002, when Prisma reports them. */
export function uniqueViolationFields(e: unknown): string[] {
  if (!isUniqueViolation(e)) return [];
  const meta = (e as { meta?: { target?: unknown } }).meta;
  const target = meta?.target;
  if (Array.isArray(target)) return target.map(String);
  // Prisma sometimes reports a single string rather than an array.
  return typeof target === "string" ? [target] : [];
}