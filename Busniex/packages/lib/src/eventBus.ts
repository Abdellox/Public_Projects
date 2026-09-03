/**
 * In-memory event bus used by the modular monolith to decouple modules.
 *
 * Modules publish domain events (e.g. InvoicePaid) that other modules consume.
 * Today this is in-process; the interface is shaped so the implementation can
 * later be swapped for Redis / a message broker without changing callers.
 */
export type DomainEventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

export interface DomainEvent<T> {
  type: string;
  aggregateType: string;
  aggregateId: string;
  payload: T;
  at: Date;
}

export interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe(type: string, handler: DomainEventHandler): () => void;
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<DomainEventHandler>>();

  subscribe(type: string, handler: DomainEventHandler): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const set = this.handlers.get(event.type);
    if (!set) return;
    for (const handler of Array.from(set)) {
      await handler(event);
    }
  }

  count(type: string): number {
    return this.handlers.get(type)?.size ?? 0;
  }
}
