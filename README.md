# outbox-core

Pure TypeScript SPI for the [transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html).

Zero external dependencies. Zero framework. Zero ORM.

---

## What it is

`outbox-core` defines the contracts and relay mechanics for the transactional outbox pattern. It is part of a trilogy of technical SPIs alongside `ddd-core` and `cqrs-core`.

It is consumed by:
- `bc-xxx/infrastructure` — implements `OutboxRepository` with a concrete storage (e.g. Drizzle/PostgreSQL)
- `apps/xxx` — implements `MessageDispatcher` with a concrete broker (e.g. RabbitMQ, NestJS in-process EventBus) and instantiates `OutboxProcessor`

---

## What it does NOT include

- No PostgreSQL, no Drizzle, no ORM
- No RabbitMQ, no amqplib, no message broker
- No NestJS, no `@nestjs/cqrs`, no framework
- No bounded context, no aggregate, no domain concept

---

## Package structure

```
outbox-core/
  ├── src/
  │     ├── ports/
  │     │     ├── outbox-repository.port.ts
  │     │     └── message-dispatcher.port.ts
  │     ├── outbox-message.ts
  │     ├── outbox-processor.ts
  │     └── index.ts
  ├── package.json
  ├── tsconfig.json
  └── tsconfig.build.json
```

---

## Contracts

### `OutboxMessage`

Minimal interface to be extended by consumers:

```typescript
import type { OutboxMessage } from 'outbox-core';

interface MyOutboxMessage extends OutboxMessage {
  aggregateId: string;
  occurredAt: Date;
}
```

### `OutboxRepository<T>`

Port for storage — implemented in `bc-xxx/infrastructure`:

```typescript
import type { OutboxRepository, OutboxMessage } from 'outbox-core';

class DrizzleOutboxRepository implements OutboxRepository<MyOutboxMessage> {
  async findPending(): Promise<MyOutboxMessage[]> { /* ... */ }
  async markDispatched(id: string): Promise<void> { /* ... */ }
}
```

### `MessageDispatcher<T>`

Pluggable dispatcher port — implemented in `apps/xxx`:

```typescript
import type { MessageDispatcher, OutboxMessage } from 'outbox-core';

class RabbitMQDispatcher implements MessageDispatcher<MyOutboxMessage> {
  async dispatch(message: MyOutboxMessage): Promise<void> { /* ... */ }
}
```

---

## Instantiating `OutboxProcessor`

`OutboxProcessor` is framework-agnostic — no decorators, no DI annotations. Instantiate it wherever you schedule polling:

```typescript
import { OutboxProcessor } from 'outbox-core';

const processor = new OutboxProcessor(
  new DrizzleOutboxRepository(),
  new RabbitMQDispatcher(),
  // optional: pass your own logger (must implement { error(...): void })
  logger,
);

// Call process() on a schedule (e.g. setInterval, NestJS @Cron, etc.)
await processor.process();
```

`process()` will:
1. Call `findPending()` on the repository
2. For each pending message, call `dispatch()` on the dispatcher
3. On successful dispatch, call `markDispatched()` on the repository
4. Handle errors per-message — one failed dispatch does not block the others

---

## Optional Logger port

`OutboxProcessor` accepts an optional `Logger` as its third constructor argument:

```typescript
export interface Logger {
  error(message: string, ...args: unknown[]): void;
}
```

If not provided, it defaults to `console`. You can plug in any logger (Pino, Winston, NestJS Logger, etc.) as long as it satisfies the interface.

---

## Build

```bash
npm install
npm run build   # outputs to dist/
```
