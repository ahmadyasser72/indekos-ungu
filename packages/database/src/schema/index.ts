import { sql } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

import type { AuditDetails } from "./audit-helpers";

export * from "./audit-helpers";

export const USER_ROLES = ["admin", "staff", "owner", "system"] as const;
export const INVOICE_STATUS = ["unpaid", "paid", "overdue"] as const;
export const CHATBOT_DIRECTIONS = ["incoming", "outgoing"] as const;
export const CHATBOT_MESSAGE_STATUS = ["pending", "sent"] as const;
export const CHAT_REQUEST_STATUS = [
	"pending",
	"accepted",
	"closed",
	"cancelled",
] as const;
export const NOTIFICATION_TYPES = [
	"reminder",
	"overdue_reminder",
	"payment_success",
	"welcome",
	"phone_change",
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

const CASCADE = { onDelete: "cascade" } as const;

export interface PushData {
	title: string;
	body: string;
	url?: string;
	urlHtmx?: string;
	imagePath?: string;
}

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
		.default(false),
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
			.references(() => tenants.id, CASCADE),
		roomId: integer("room_id")
			.notNull()
			.references(() => rooms.id, CASCADE),
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
		.references(() => leases.id, CASCADE),
	amount: integer("amount").notNull(),
	dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
	paidAt: integer("paid_at", { mode: "timestamp" }),
	duitkuReference: text("duitku_reference"),
	callbackPayload: text("callback_payload"),
	status: text("status", { enum: INVOICE_STATUS }).notNull().default("unpaid"),

	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const chatbotMessages = sqliteTable("chatbot_messages", {
	id: integer("id").primaryKey({ autoIncrement: true }),

	tenantId: integer("tenant_id")
		.notNull()
		.references(() => tenants.id, CASCADE),
	staffId: integer("staff_id").references(() => users.id, CASCADE),

	direction: text("direction", { enum: CHATBOT_DIRECTIONS }).notNull(),
	message: text("message").notNull(),
	status: text("status", { enum: CHATBOT_MESSAGE_STATUS })
		.notNull()
		.default("sent"),
	sentAt: integer("sent_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const chatRequests = sqliteTable("chat_requests", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	tenantId: integer("tenant_id")
		.notNull()
		.references(() => tenants.id, CASCADE),
	description: text().notNull(),
	status: text("status", { enum: CHAT_REQUEST_STATUS })
		.notNull()
		.default("pending"),
	acceptedBy: integer("accepted_by").references(() => users.id, CASCADE),
	closedBy: integer("closed_by").references(() => users.id, CASCADE),
	cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
	requestedAt: integer("requested_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
	acceptedAt: integer("accepted_at", { mode: "timestamp" }),
	closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const notifications = sqliteTable("notifications", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	tenantId: integer("tenant_id")
		.notNull()
		.references(() => tenants.id, CASCADE),
	invoiceId: integer("invoice_id").references(() => invoices.id, CASCADE),

	chatbotMessageId: integer("chatbot_message_id")
		.unique()
		.references(() => chatbotMessages.id, CASCADE),

	type: text("type", { enum: NOTIFICATION_TYPES }).notNull(),
	status: text("status", { enum: NOTIFICATION_STATUS }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id").references(() => users.id, CASCADE),
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
		.references(() => tenants.id, CASCADE),
	description: text("description").notNull(),
	imagePath: text("image_path"),
	status: text("status", { enum: COMPLAINT_STATUS }).notNull().default("open"),
	processedAt: integer("processed_at", { mode: "timestamp" }),
	resolvedBy: integer("resolved_by").references(() => users.id),
	resolveNotes: text("resolve_notes"),
	resolvedAt: integer("resolved_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const botAuth = sqliteTable("bot_auth", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, CASCADE),
	endpoint: text("endpoint").notNull().unique(),
	authKey: text("auth_key").notNull(),
	p256dhKey: text("p256dh_key").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const pushHistory = sqliteTable("push_history", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	endpoint: text("endpoint")
		.notNull()
		.references(() => pushSubscriptions.endpoint, CASCADE),
	data: text({ mode: "json" }).$type<PushData>().notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export const pendingChatMessages = sqliteTable("pending_chat_messages", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	chatbotMessageId: integer("chatbot_message_id")
		.notNull()
		.references(() => chatbotMessages.id, CASCADE),
	chatRequestId: integer("chat_request_id")
		.notNull()
		.references(() => chatRequests.id, CASCADE),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`)
		.notNull(),
});

export type User = typeof users.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Lease = typeof leases.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
export type ChatRequest = typeof chatRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Complaint = typeof complaints.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type PendingChatMessage = typeof pendingChatMessages.$inferSelect;
