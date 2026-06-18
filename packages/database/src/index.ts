import path from "node:path";

import { drizzle } from "drizzle-orm/bun-sqlite";

import * as schema from "./schema";
import { relations } from "./schema/relations";

export const DB_PATH =
	process.env.DATABASE_PATH ?? path.join(import.meta.dirname, "../db.sqlite");
export const db = drizzle(DB_PATH, { schema, relations });

export * from "drizzle-orm";
