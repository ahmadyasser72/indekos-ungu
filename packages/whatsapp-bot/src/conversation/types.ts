import type { Room, Tenant } from "@indekos/database/schema";

export interface ActiveTenant extends Tenant {
	lease: { room: Room };
}

export interface InactiveTenant extends Tenant {
	lease: null;
}

export interface ConversationSession {
	jid: string;
	tenant: ActiveTenant | InactiveTenant;
	flow: string;
	step: string;
	lastActivity: number;
	data: Record<string, unknown>;
}

export interface MessageInput {
	text: string;
	image?: {
		buffer: Buffer;
		mimetype: string;
	};
}

export interface StepResult {
	reply: string;
	/** null = end session, undefined = stay on same step (retry/error), string = next step id */
	next?: string | null;
}

export type StepHandler = (
	input: MessageInput,
	session: ConversationSession,
) => StepResult | Promise<StepResult>;

export interface FlowDef {
	name: string;
	initialStep: string;
	steps: Record<string, StepHandler>;
}
