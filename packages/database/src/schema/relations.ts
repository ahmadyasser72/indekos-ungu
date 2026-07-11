import { defineRelations } from "drizzle-orm";

import * as schema from ".";

export const relations = defineRelations(schema, (r) => ({
	users: {
		logs: r.many.auditLogs({
			from: r.users.id,
			to: r.auditLogs.userId,
		}),
		resolvedComplaints: r.many.complaints({
			from: r.users.id,
			to: r.complaints.resolvedBy,
		}),
		pushSubscriptions: r.many.pushSubscriptions({
			from: r.users.id,
			to: r.pushSubscriptions.userId,
		}),
	},

	pushSubscriptions: {
		user: r.one.users({
			from: r.pushSubscriptions.userId,
			to: r.users.id,
			optional: true,
		}),
	},

	tenants: {
		leaseHistory: r.many.leases({
			from: r.tenants.id,
			to: r.leases.tenantId,
			where: { isActive: false },
		}),
		lease: r.one.leases({
			from: r.tenants.id,
			to: r.leases.tenantId,
			where: { isActive: true },
		}),

		chatbotLogs: r.many.chatbotMessages({
			from: r.tenants.id,
			to: r.chatbotMessages.tenantId,
		}),
		chatRequest: r.many.chatRequests({
			from: r.tenants.id,
			to: r.chatRequests.tenantId,
		}),
	},

	rooms: {
		leaseHistory: r.many.leases({
			from: r.rooms.id,
			to: r.leases.roomId,
			where: { isActive: false },
		}),
		lease: r.one.leases({
			from: r.rooms.id,
			to: r.leases.roomId,
			where: { isActive: true },
		}),
	},

	leases: {
		tenant: r.one.tenants({
			from: r.leases.tenantId,
			to: r.tenants.id,
			optional: false,
		}),
		room: r.one.rooms({
			from: r.leases.roomId,
			to: r.rooms.id,
			optional: false,
		}),
		invoices: r.many.invoices({
			from: r.leases.id,
			to: r.invoices.leaseId,
		}),
	},

	invoices: {
		lease: r.one.leases({
			from: r.invoices.leaseId,
			to: r.leases.id,
			optional: false,
		}),
		notifications: r.many.notifications({
			from: r.invoices.id,
			to: r.notifications.invoiceId,
		}),
	},

	complaints: {
		tenant: r.one.tenants({
			from: r.complaints.tenantId,
			to: r.tenants.id,
			optional: false,
		}),
		resolver: r.one.users({
			from: r.complaints.resolvedBy,
			to: r.users.id,
		}),
	},

	auditLogs: {
		user: r.one.users({
			from: r.auditLogs.userId,
			to: r.users.id,
		}),
	},

	chatbotMessages: {
		tenant: r.one.tenants({
			from: r.chatbotMessages.tenantId,
			to: r.tenants.id,
			optional: false,
		}),
		notification: r.one.notifications({
			from: r.chatbotMessages.id,
			to: r.notifications.chatbotMessageId,
		}),

		sentBy: r.one.users({
			from: r.chatbotMessages.staffId,
			to: r.users.id,
			where: { displayName: { isNotNull: true } },
		}),
	},

	chatRequests: {
		tenant: r.one.tenants({
			from: r.chatRequests.tenantId,
			to: r.tenants.id,
			optional: false,
		}),
		pendingMessages: r.many.pendingChatMessages({
			from: r.chatRequests.id,
			to: r.pendingChatMessages.chatRequestId,
		}),
	},

	pendingChatMessages: {
		chatbotMessage: r.one.chatbotMessages({
			from: r.pendingChatMessages.chatbotMessageId,
			to: r.chatbotMessages.id,
			optional: false,
		}),
	},

	notifications: {
		tenant: r.one.tenants({
			from: r.notifications.tenantId,
			to: r.tenants.id,
			optional: false,
		}),
		invoice: r.one.invoices({
			from: r.notifications.invoiceId,
			to: r.invoices.id,
		}),
		chatbotMessage: r.one.chatbotMessages({
			from: r.notifications.chatbotMessageId,
			to: r.chatbotMessages.id,
		}),
	},
}));
