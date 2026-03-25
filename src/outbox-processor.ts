import type { OutboxMessage } from './outbox-message.js';
import type { OutboxRepository } from './ports/outbox-repository.port.js';
import type { MessageDispatcher } from './ports/message-dispatcher.port.js';

export interface Logger {
  error(message: string, ...args: unknown[]): void;
}

export class OutboxProcessor<T extends OutboxMessage> {
  private readonly repository: OutboxRepository<T>;
  private readonly dispatcher: MessageDispatcher<T>;
  private readonly logger: Logger;

  constructor(
    repository: OutboxRepository<T>,
    dispatcher: MessageDispatcher<T>,
    logger: Logger = console,
  ) {
    this.repository = repository;
    this.dispatcher = dispatcher;
    this.logger = logger;
  }

  async process(): Promise<void> {
    const pending = await this.repository.findPending();

    for (const message of pending) {
      try {
        await this.dispatcher.dispatch(message);
        await this.repository.markDispatched(message.id);
      } catch (err) {
        this.logger.error(
          `[OutboxProcessor] Failed to dispatch message id=${message.id} destination=${message.destination}`,
          err,
        );
      }
    }
  }
}
