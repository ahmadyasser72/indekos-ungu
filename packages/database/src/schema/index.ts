import { sql } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import type { AuditDetails } from "./audit-helpers";

export const USER_ROLES = ["admin", "staff", "owner", "system"] as const;
export const INVOICE_STATUS = ["unpaid", "paid", "overdue"] as const;
export const CHATBOT_DIRECTIONS = ["incoming", "outgoing"] as const;
export const NOTIFICATION_TYPES = [
	"reminder",
	"payment_success",
	"welcome",
	"custom",
] as const;
export const NOTIFICATION_STATUS = ["pending", "sent", "failed"] as const;
export const COMPLAINT_STATUS = ["open", "in_progress", "resolved"] as const;
export const ROOM_TYPES = ["standard", "premium"] as const;

export const AUDIT_ACTIONS = [
	"CREATE",
	"UPDATE",
	"DELETE",
	"REJECT",
	"LOGIN",
] as const;

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	displayName: text("display_name"),
	role: text("role", { enum: USER_ROLES }).notNull(),
	lastAccessed: integer("last_accessed", { mode: "timestamp" }),
});

export const tenants = sqliteTable("tenants", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	fullName: text("full_name").notNull(),
	phoneNumber: text("phone_number").notNull(),
	originRegion: text("origin_region"),
	isVerified: integer("is_verified", { mode: "boolean" })
		.notNull()
		.default(true),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const rooms = sqliteTable("rooms", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	roomNumber: text("room_number").notNull().unique(),
	roomType: text("room_type", { enum: ROOM_TYPES })
		.notNull()
		.default("standard"),
	monthlyPrice: integer("monthly_price").notNull(),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const leases = sqliteTable(
	"leases",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		tenantId: integer("tenant_id")
			.notNull()
			.references(() => tenants.id),
		roomId: integer("room_id")
			.notNull()
			.references(() => rooms.id),
		startDate: integer("start_date", { mode: "timestamp" }).notNull(),
		endDate: integer("end_date", { mode: "timestamp" }),
		isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	},
	(table) => [
		uniqueIndex("unique_active_lease")
			.on(table.tenantId)
			.where(sql`${table.isActive} = 1`),
	],
);

export const invoices = sqliteTable("invoices", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	leaseId: integer("lease_id")
		.notNull()
		.references(() => leases.id),
	amount: integer("amount").notNull(),
	dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
	paidAt: integer("paid_at", { mode: "timestamp" }),
	duitkuReference: text("duitku_reference"),
	callbackPayload: text("callback_payload"),
	status: text("status", { enum: INVOICE_STATUS }).notNull().default("unpaid"),
});

export const chatbotMessages = sqliteTable("chatbot_messages", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	tenantId: integer("tenant_id")
		.notNull()
		.references(() => tenants.id),
	direction: text("direction", { enum: CHATBOT_DIRECTIONS }).notNull(),
	message: text("message").notNull(),
	sentAt: integer("sent_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const notifications = sqliteTable("notifications", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	tenantId: integer("tenant_id")
		.notNull()
		.references(() => tenants.id),
	invoiceId: integer("invoice_id").references(() => invoices.id),

	chatbotMessageId: integer("chatbot_message_id")
		.unique()
		.references(() => chatbotMessages.id),

	type: text("type", { enum: NOTIFICATION_TYPES }).notNull(),
	status: text("status", { enum: NOTIFICATION_STATUS }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id").references(() => users.id),
	action: text("action", { enum: AUDIT_ACTIONS }).notNull(),
	tableName: text("table_name").notNull(),
	recordId: integer("record_id"),
	details: text("details", { mode: "json" }).$type<AuditDetails>(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const complaints = sqliteTable("complaints", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	tenantId: integer("tenant_id")
		.notNull()
		.references(() => tenants.id),
	description: text("description").notNull(),
	status: text("status", { enum: COMPLAINT_STATUS }).notNull().default("open"),
	resolvedBy: integer("resolved_by").references(() => users.id),
	resolveNotes: text("resolve_notes"),
	resolvedNotified: integer("resolved_notified", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const botAuth = sqliteTable("bot_auth", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

export { auditDetail } from "./audit-helpers";
export type { AuditDetails } from "./audit-helpers";
export { CRON_TABLES } from "./audit-helpers";
