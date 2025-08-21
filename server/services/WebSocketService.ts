import { WebSocket, WebSocketServer } from 'ws';
import { Server } from '@hono/node-server';

export interface WebSocketMessage {
	type: 'habit_completed' | 'habit_skipped' | 'tier_unlocked' | 'streak_updated' | 'notification';
	data: any;
	timestamp: Date;
}

export interface WebSocketClient {
	id: string;
	userId: string;
	ws: WebSocket;
	isAlive: boolean;
}

export class WebSocketService {
	private wss: WebSocketServer | null = null;
	private clients: Map<string, WebSocketClient> = new Map();
	private heartbeatInterval: NodeJS.Timeout | null = null;

	initialize(server: Server) {
		this.wss = new WebSocketServer({ server });

		this.wss.on('connection', (ws: WebSocket, request) => {
			this.handleConnection(ws, request);
		});

		this.startHeartbeat();
		console.log('🔌 WebSocket service initialized');
	}

	private handleConnection(ws: WebSocket, request: any) {
		const clientId = this.generateClientId();
		const userId = this.extractUserId(request);

		const client: WebSocketClient = {
			id: clientId,
			userId,
			ws,
			isAlive: true
		};

		this.clients.set(clientId, client);
		console.log(`🔌 WebSocket client connected: ${clientId} (User: ${userId})`);

		// Send welcome message
		this.sendToClient(clientId, {
			type: 'notification',
			data: { message: 'Connected to Habit TKS real-time updates' },
			timestamp: new Date()
		});

		ws.on('message', (message) => {
			try {
				const parsed = JSON.parse(message.toString());
				this.handleMessage(clientId, parsed);
			} catch (error) {
				console.error('Failed to parse WebSocket message:', error);
			}
		});

		ws.on('close', () => {
			this.clients.delete(clientId);
			console.log(`🔌 WebSocket client disconnected: ${clientId}`);
		});

		ws.on('error', (error) => {
			console.error(`WebSocket error for client ${clientId}:`, error);
			this.clients.delete(clientId);
		});

		ws.on('pong', () => {
			const client = this.clients.get(clientId);
			if (client) {
				client.isAlive = true;
			}
		});
	}

	private handleMessage(clientId: string, message: any) {
		const client = this.clients.get(clientId);
		if (!client) return;

		switch (message.type) {
			case 'ping':
				this.sendToClient(clientId, {
					type: 'pong',
					data: { timestamp: Date.now() },
					timestamp: new Date()
				});
				break;

			case 'subscribe':
				// Handle subscription to specific event types
				console.log(`Client ${clientId} subscribed to: ${message.events}`);
				break;

			default:
				console.log(`Unknown message type from client ${clientId}:`, message.type);
		}
	}

	private startHeartbeat() {
		this.heartbeatInterval = setInterval(() => {
			this.clients.forEach((client, clientId) => {
				if (!client.isAlive) {
					console.log(`Terminating inactive client: ${clientId}`);
					client.ws.terminate();
					this.clients.delete(clientId);
					return;
				}

				client.isAlive = false;
				client.ws.ping();
			});
		}, 30000); // 30 seconds
	}

	// Public methods for broadcasting events
	broadcastToUser(userId: string, message: WebSocketMessage) {
		this.clients.forEach((client) => {
			if (client.userId === userId) {
				this.sendToClient(client.id, message);
			}
		});
	}

	broadcastToAll(message: WebSocketMessage) {
		this.clients.forEach((client) => {
			this.sendToClient(client.id, message);
		});
	}

	private sendToClient(clientId: string, message: WebSocketMessage) {
		const client = this.clients.get(clientId);
		if (client && client.ws.readyState === WebSocket.OPEN) {
			try {
				client.ws.send(JSON.stringify(message));
			} catch (error) {
				console.error(`Failed to send message to client ${clientId}:`, error);
			}
		}
	}

	private generateClientId(): string {
		return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private extractUserId(request: any): string {
		// Extract user ID from request headers or query params
		// For now, use a default user ID
		return 'demo_user_123';
	}

	// Event-specific broadcast methods
	notifyHabitCompleted(userId: string, habitData: any) {
		this.broadcastToUser(userId, {
			type: 'habit_completed',
			data: habitData,
			timestamp: new Date()
		});
	}

	notifyHabitSkipped(userId: string, habitData: any) {
		this.broadcastToUser(userId, {
			type: 'habit_skipped',
			data: habitData,
			timestamp: new Date()
		});
	}

	notifyTierUnlocked(userId: string, tierData: any) {
		this.broadcastToUser(userId, {
			type: 'tier_unlocked',
			data: tierData,
			timestamp: new Date()
		});
	}

	notifyStreakUpdated(userId: string, streakData: any) {
		this.broadcastToUser(userId, {
			type: 'streak_updated',
			data: streakData,
			timestamp: new Date()
		});
	}

	getConnectedClientsCount(): number {
		return this.clients.size;
	}

	getConnectedUsersCount(): number {
		const uniqueUsers = new Set(Array.from(this.clients.values()).map(c => c.userId));
		return uniqueUsers.size;
	}

	shutdown() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}

		this.clients.forEach((client) => {
			client.ws.close();
		});

		if (this.wss) {
			this.wss.close();
		}

		console.log('🔌 WebSocket service shut down');
	}
}

export const webSocketService = new WebSocketService();
