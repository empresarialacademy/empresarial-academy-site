import { readFileSync } from "fs";
import { Client } from "pg";

const env = readFileSync(new URL("../.env.production.local", import.meta.url), "utf8");
const uri = env.match(/DATABASE_URI=(.*)/)[1].trim();

const client = new Client({ connectionString: uri });
await client.connect();

async function run(sql, label) {
  await client.query(sql);
  console.log("OK:", label);
}

async function exists(kind, name) {
  if (kind === "type") {
    const r = await client.query(`SELECT 1 FROM pg_type WHERE typname = $1`, [name]);
    return r.rowCount > 0;
  }
  const r = await client.query(`SELECT to_regclass($1) as c`, [`public.${name}`]);
  return r.rows[0].c !== null;
}

try {
  await client.query("BEGIN");

  if (!(await exists("type", "enum_api_inventory_category"))) {
    await run(
      `CREATE TYPE "public"."enum_api_inventory_category" AS ENUM('ia', 'redes-sociais', 'marketing', 'email', 'mensageria', 'infra', 'outro')`,
      "enum_api_inventory_category",
    );
  }
  if (!(await exists("type", "enum_api_inventory_status"))) {
    await run(
      `CREATE TYPE "public"."enum_api_inventory_status" AS ENUM('ativo', 'bloqueado', 'pendente', 'dormente', 'cancelamento')`,
      "enum_api_inventory_status",
    );
  }
  if (!(await exists("type", "enum_api_inventory_billing_type"))) {
    await run(
      `CREATE TYPE "public"."enum_api_inventory_billing_type" AS ENUM('gratuito', 'pre-pago', 'pos-pago', 'assinatura', 'a-confirmar')`,
      "enum_api_inventory_billing_type",
    );
  }

  if (!(await exists("table", "api_inventory"))) {
    await run(
      `CREATE TABLE "public"."api_inventory" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "provider" varchar NOT NULL,
        "category" "public"."enum_api_inventory_category" DEFAULT 'outro',
        "status" "public"."enum_api_inventory_status" DEFAULT 'ativo',
        "expires_at" timestamp(3) with time zone,
        "renewal_cycle" varchar,
        "has_billing" boolean DEFAULT false,
        "billing_type" "public"."enum_api_inventory_billing_type",
        "balance_or_cost" varchar,
        "balance_checked_at" timestamp(3) with time zone,
        "billing_link" varchar,
        "credential_location" varchar,
        "notes" varchar,
        "last_verified" timestamp(3) with time zone,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      "table api_inventory",
    );
    await run(
      `CREATE INDEX "api_inventory_updated_at_idx" ON "public"."api_inventory" USING btree ("updated_at")`,
      "index api_inventory.updated_at",
    );
    await run(
      `CREATE INDEX "api_inventory_created_at_idx" ON "public"."api_inventory" USING btree ("created_at")`,
      "index api_inventory.created_at",
    );
  }

  if (!(await exists("table", "api_inventory_systems"))) {
    await run(
      `CREATE TABLE "public"."api_inventory_systems" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "system" varchar NOT NULL,
        "env_var" varchar,
        "active" boolean DEFAULT true
      )`,
      "table api_inventory_systems",
    );
    await run(
      `ALTER TABLE "public"."api_inventory_systems" ADD CONSTRAINT "api_inventory_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."api_inventory"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      "fk api_inventory_systems._parent_id",
    );
    await run(
      `CREATE INDEX "api_inventory_systems_order_idx" ON "public"."api_inventory_systems" USING btree ("_order")`,
      "index api_inventory_systems._order",
    );
    await run(
      `CREATE INDEX "api_inventory_systems_parent_id_idx" ON "public"."api_inventory_systems" USING btree ("_parent_id")`,
      "index api_inventory_systems._parent_id",
    );
  }

  for (const relsTable of ["payload_locked_documents_rels", "payload_preferences_rels"]) {
    const colCheck = await client.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = 'api_inventory_id'`,
      [relsTable],
    );
    if (colCheck.rowCount === 0) {
      await run(
        `ALTER TABLE "public"."${relsTable}" ADD COLUMN "api_inventory_id" integer`,
        `add api_inventory_id to ${relsTable}`,
      );
      await run(
        `ALTER TABLE "public"."${relsTable}" ADD CONSTRAINT "${relsTable}_api_inventory_fk" FOREIGN KEY ("api_inventory_id") REFERENCES "public"."api_inventory"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        `fk ${relsTable}.api_inventory_id`,
      );
      await run(
        `CREATE INDEX "${relsTable}_api_inventory_id_idx" ON "public"."${relsTable}" USING btree ("api_inventory_id")`,
        `index ${relsTable}.api_inventory_id`,
      );
    } else {
      console.log("already exists:", relsTable, "api_inventory_id");
    }
  }

  await client.query("COMMIT");
  console.log("COMMITTED");
} catch (e) {
  await client.query("ROLLBACK");
  console.error("ROLLED BACK due to error:", e.message);
  throw e;
}

const finalCols = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'api_inventory' ORDER BY ordinal_position`,
);
console.log("final api_inventory columns:", finalCols.rows.map((r) => r.column_name).join(", "));

await client.end();
console.log("done");
