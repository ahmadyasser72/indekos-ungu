import type { ConversationSession, FlowDef, MessageInput } from "./types";

const SESSION_TIMEOUT_MS = 5 * 60 * 1_000; // 5 menit inactivity
const CLEANUP_INTERVAL_MS = 30 * 1_000; // 30 detik

export class ConversationManager {
	private sessions = new Map<string, ConversationSession>();
	private flows = new Map<string, FlowDef>();
	private cleanupTimer: ReturnType<typeof setInterval> | null = null;

	registerFlow(flow: FlowDef): void {
		this.flows.set(flow.name, flow);
	}

	/** Check if session expired, cleanup if yes. */
	private isExpired(session: ConversationSession): boolean {
		return Date.now() - session.lastActivity > SESSION_TIMEOUT_MS;
	}

	/** True if JID has active (non-expired) session. */
	hasActiveSession(jid: string): boolean {
		const session = this.sessions.get(jid);
		if (!session) return false;
		if (this.isExpired(session)) {
			this.endSession(jid);
			return false;
		}
		return true;
	}

	/** Start new session for a JID. */
	startSession(
		jid: string,
		tenant: ConversationSession["tenant"],
		flowName: string,
	): void {
		const flow = this.flows.get(flowName);
		if (!flow) throw new Error(`Flow '${flowName}' not registered`);

		this.sessions.set(jid, {
			jid,
			tenant,
			flow: flowName,
			step: flow.initialStep,
			lastActivity: Date.now(),
			data: {},
    });

		if (!this.cleanupTimer) this.startCleanup();
	}

	/**
	 * Route message to active session step handler.
	 * Returns reply string, or null if no active session.
	 */
	async handleMessage(
		jid: string,
		input: MessageInput,
	): Promise<string | null> {
		const session = this.sessions.get(jid);
		if (!session) return null;

		// Expired?
		if (this.isExpired(session)) {
			this.endSession(jid);
			return null;
		}

		const flow = this.flows.get(session.flow);
		if (!flow) {
			this.endSession(jid);
			return null;
		}

		const handler = flow.steps[session.step];
		if (!handler) {
			this.endSession(jid);
			return null;
		}

		const result = await handler(input, session);

		if (result.next === null) {
			this.endSession(jid);
		} else if (result.next) {
			session.step = result.next;
			session.lastActivity = Date.now();
		} else {
			// Same step (retry/validation error)
			session.lastActivity = Date.now();
		}

		return result.reply;
	}

	private endSession(jid: string): void {
		this.sessions.delete(jid);
	}

	private startCleanup(): void {
		this.cleanupTimer = setInterval(() => {
			const now = Date.now();
			for (const [jid, session] of this.sessions) {
				if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
					this.sessions.delete(jid);
				}
			}

			if (this.sessions.size === 0) {
				clearInterval(this.cleanupTimer!);
				this.cleanupTimer = null;
			}
		}, CLEANUP_INTERVAL_MS);
	}
}
