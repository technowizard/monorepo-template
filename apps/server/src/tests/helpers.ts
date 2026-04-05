import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

type DrizzleDb = ReturnType<typeof drizzle>;

export async function cleanDatabase(db: DrizzleDb) {
  const result = await db.execute<{ tablename: string }>(
    sql`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename != '__drizzle_migrations'
    `
  );

  const tables = result.rows.map((r) => r.tablename);

  if (tables.length === 0) {
    return;
  }

  await db.execute(
    sql`TRUNCATE TABLE ${sql.join(
      tables.map((t) => sql.identifier(t)),
      sql`, `
    )} RESTART IDENTITY CASCADE`
  );
}
