import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { GetDatabaseUrl } from "@/lib/env";

let database: ReturnType<typeof CreateDatabase> | undefined;

function CreateDatabase() {
  const client = postgres(GetDatabaseUrl(), {
    max: 5,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle({ client, schema });
}

export function GetDatabase() {
  database ??= CreateDatabase();
  return database;
}

export type Database = ReturnType<typeof GetDatabase>;
