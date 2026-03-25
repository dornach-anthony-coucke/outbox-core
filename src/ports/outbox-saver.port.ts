import type { OutboxMessage } from '../outbox-message.js';

export interface OutboxSaver<T extends OutboxMessage = OutboxMessage> {
  save(message: T): Promise<void>;
}
