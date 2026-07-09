import type { Logger } from "pino";

import type { ConversationSession, FlowDef, MessageInput } from "./types";

const SESSION_TIMEOUT_MS = 5 * 60 * 1_000; // 5 menit inactivity
const CLEANUP_INTERVAL_MS = 30 * 1_000; // 30 detik

export class ConversationManager {
	private sessions = new Map<string, ConversationSession>();
	private flows = new Map<string, FlowDef>();
	private cleanupTimer: ReturnType<typeof setInterval> | null = null;
	private logger?: Logger;

	constructor(options?: { logger?: Logger }) {
		this.logger = options?.logger?.child({ submodule: "conversation:manager" });
	}

	registerFlow(flow: FlowDef): void {
		this.flows.set(flow.name, flow);
		this.logger?.debug({ flowName: flow.name }, "flow registered");
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

		this.logger?.info(
			{ jid: jid, flowName: flowName, tenantId: tenant.id },
			"conversation session started",
		);

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
		if (!session) {
			this.logger?.debug({ jid: jid }, "no active session found");
			return null;
		}

		// Expired?
		if (this.isExpired(session)) {
			this.logger?.info(
				{ jid: jid, flowName: session.flow },
				"session expired",
			);
			this.endSession(jid);
			return null;
		}

		const flow = this.flows.get(session.flow);
		if (!flow) {
			this.logger?.error(
				{ jid: jid, flowName: session.flow },
				"flow not found for active session",
			);
			this.endSession(jid);
			return null;
		}

		const handler = flow.steps[session.step];
		if (!handler) {
			this.logger?.error(
				{ jid: jid, flowName: session.flow, stepName: session.step },
				"step handler not found",
			);
			this.endSession(jid);
			return null;
		}

		try {
			const result = await handler(input, session, { logger: this.logger });

			if (result.next === null) {
				this.logger?.info(
					{ jid: jid, flowName: session.flow },
					"conversation flow completed",
				);
				this.endSession(jid);
			} else if (result.next) {
				this.logger?.debug(
					{
						jid: jid,
						flowName: session.flow,
						fromStep: session.step,
						toStep: result.next,
					},
					"moving to next step",
				);
				session.step = result.next;
				session.lastActivity = Date.now();
			} else {
				// Same step (retry/validation error)
				session.lastActivity = Date.now();
			}

			return result.reply;
		} catch (error) {
			this.logger?.error(
				{
					error,
					jid: jid,
					flowName: session.flow,
					stepName: session.step,
				},
				"step handler failed",
			);
			this.endSession(jid);
			throw error;
		}
	}

	private endSession(jid: string): void {
		const session = this.sessions.get(jid);
		if (session) {
			this.logger?.debug({ jid: jid, flowName: session.flow }, "session ended");
		}
		this.sessions.delete(jid);
	}

	private startCleanup(): void {
		this.logger?.debug("starting session cleanup timer");
		this.cleanupTimer = setInterval(() => {
			const now = Date.now();
			let cleanedCount = 0;
			for (const [jid, session] of this.sessions) {
				if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
					this.sessions.delete(jid);
					cleanedCount++;
				}
			}

			if (cleanedCount > 0) {
				this.logger?.info(
					{ cleanedCount: cleanedCount },
					"expired sessions cleaned up",
				);
			}

			if (this.sessions.size === 0) {
				this.logger?.debug("stopping cleanup timer, no active sessions");
				clearInterval(this.cleanupTimer!);
				this.cleanupTimer = null;
			}
		}, CLEANUP_INTERVAL_MS);
	}
}
