import path from "node:path";
import { MONOREPO_ROOT } from "@indekos/utilities/monorepo";

import { drizzle } from "drizzle-orm/bun-sqlite";

import * as schema from "./schema";
import { relations } from "./schema/relations";

export const {
	USER_ROLES,
	INVOICE_STATUS,
	CHATBOT_DIRECTIONS,
	CHATBOT_MESSAGE_STATUS,
	CHAT_REQUEST_STATUS,
	NOTIFICATION_TYPES,
	NOTIFICATION_STATUS,
	COMPLAINT_STATUS,
	AUDIT_ACTIONS,
	ROOM_TYPES,
} = schema;

export { eq, ne, and, inArray, sql } from "drizzle-orm";

export const DB_PATH = path.resolve(
	MONOREPO_ROOT,
	process.env.DATABASE_PATH ?? "db.sqlite",
);
export const db = drizzle(DB_PATH, { schema, relations });
