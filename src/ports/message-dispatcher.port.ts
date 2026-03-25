import type { OutboxMessage } from '../outbox-message.js';

export interface MessageDispatcher<T extends OutboxMessage> {
  dispatch(message: T): Promise<void>;
}
