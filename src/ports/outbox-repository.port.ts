import type { OutboxMessage } from '../outbox-message.js';

export interface OutboxRepository<T extends OutboxMessage> {
  findPending(): Promise<T[]>;
  markDispatched(id: string): Promise<void>;
}
