/**
 * Migração one-shot do conteúdo: SQLite (dev) → Postgres (Neon).
 * Os schemas são espelhados (mesmas tabelas/colunas via drizzle), então a
 * cópia é direta, preservando IDs (inclusive hash/salt do admin — a senha
 * continua a mesma). Ao final, ajusta as sequences do Postgres.
 *
 * Uso: DATABASE_URI="postgresql://..." node scripts/migrate-sqlite-to-pg.mjs
 * (rodar a partir da raiz do projeto; o SQLite é lido de ./empresarial-academy.db)
 */
import { createClient } from "@libsql/client";
import pg from "pg";

const PG_URI = process.env.DATABASE_URI;
if (!PG_URI || !PG_URI.startsWith("postgres")) {
  console.error("Defina DATABASE_URI com a connection string do Postgres.");
  process.exit(1);
}

const sqlite = createClient({ url: "file:./empresarial-academy.db" });
const pool = new pg.Pool({ connectionString: PG_URI });

/** colunas booleanas por tabela (sqlite guarda 0/1; pg exige boolean) */
const BOOL_COLS = { materials: ["featured"] };
/** colunas JSON por tabela (sqlite guarda texto; pg é jsonb) */
const JSON_COLS = { posts: ["content"] };

async function copyTable(table) {
  const { rows } = await sqlite.execute(`SELECT * FROM ${table}`);
  if (rows.length === 0) {
    console.log(`- ${table}: 0 linhas (pulado)`);
    return 0;
  }
  const cols = Object.keys(rows[0]);
  for (const row of rows) {
    const values = cols.map((c) => {
      let v = row[c];
      if (v === undefined) v = null;
      if ((BOOL_COLS[table] || []).includes(c) && v !== null) v = Boolean(v);
      if ((JSON_COLS[table] || []).includes(c) && typeof v === "string") {
        try { v = JSON.parse(v); } catch { /* mantém string */ }
      }
      return v;
    });
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const colNames = cols.map((c) => `"${c}"`).join(", ");
    await pool.query(
      `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
      values,
    );
  }
  // Ajusta a sequence para não colidir com os IDs preservados.
  await pool.query(
    `SELECT setval(pg_get_serial_sequence('"${table}"','id'), (SELECT COALESCE(MAX(id),1) FROM "${table}"))`,
  );
  console.log(`- ${table}: ${rows.length} linhas migradas`);
  return rows.length;
}

// Ordem respeita as FKs: referenciados antes dos referenciadores.
const ORDER = [
  "users",
  "categories",
  "material_categories",
  "media",
  "material_files",
  "posts",
  "materials",
  "testimonials",
];

try {
  console.log("Migrando SQLite → Postgres (Neon)...");
  let total = 0;
  for (const t of ORDER) total += await copyTable(t);

  // Verificação final: contagens no destino.
  console.log("\nContagens no Postgres:");
  for (const t of ORDER) {
    const { rows } = await pool.query(`SELECT COUNT(*)::int c FROM "${t}"`);
    console.log(`  ${t}: ${rows[0].c}`);
  }
  console.log(`\nOK — ${total} linhas migradas.`);
} finally {
  await pool.end();
}
