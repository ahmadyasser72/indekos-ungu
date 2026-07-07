import path from "node:path";

import { Eta } from "eta";

const eta = new Eta({
	views: path.join(import.meta.dirname, "templates"),
	autoTrim: false,
});

// Maps template name → param type.
// Short one-liner errors stay in command code; multi-line messages go here.
interface TemplateParams {
	help: { fullName: string };
	"check-bills": {
		roomNumber: string;
		roomType: string;
		monthlyPrice: string;
		unpaid: Array<{
			id: string;
			amount: string;
			dueDate: string;
			createdAt: string;
			paymentUrl: string | null;
		}>;
		total: string;
		hasPaymentLink: boolean;
	};
	"check-complaint": {
		id: number;
		description: string;
		createdAt: string;
		processedAt: string | null;
		resolvedAt: string | null;
		status: string;
		resolveNotes: string | null;
		resolverName: string;
	};
	"list-complaints": {
		items: Array<{
			id: number;
			description: string;
			createdAt: string;
			status: string;
		}>;
	};
	"submit-complaint": {
		id: number;
		description: string;
		createdAt: string;
	};
	"submit-complaint-format": Record<string, never>;
	"payment-history": {
		paid: Array<{ id: string; amount: string; dueDate: string }>;
	};
	"tenant-info": {
		fullName: string;
		phoneNumber: string;
		originRegion: string;
		roomNumber: string;
		roomType: string;
		monthlyPrice: string;
		startDate: string;
		endDate: string;
		hasUnpaid: boolean;
	};
	"complaint-in-progress": {
		fullName: string;
		id: number;
		description: string;
	};
	"complaint-resolved": {
		fullName: string;
		id: number;
		description: string;
		resolveNotes: string | null;
		resolverDisplayName: string;
	};
	welcome: {
		fullName: string;
		roomNumber: string | null;
	};
	"payment-success": {
		fullName: string;
		roomNumber: string | null;
		amount: string | null;
		date: string | null;
		invoiceUrl: string | null;
	};
	"payment-reminder": {
		fullName: string;
		roomNumber: string | null;
		amount: string | null;
		dueDate: string | null;
		paymentUrl: string | null;
	};
	"complaint-prompt": Record<string, never>;
	"no-lease-complaint": Record<string, never>;
	"unknown-number": Record<string, never>;
	"unknown-command": Record<string, never>;
	"verification-success": {
		fullName: string;
	};
	"verification-prompt": {
		fullName: string;
	};
	"phone-change-verification": {
		fullName: string;
	};
}

export const render = <K extends keyof TemplateParams>(
	name: K,
	params: TemplateParams[K],
) => eta.render(`./${name}`, params).trimEnd();
