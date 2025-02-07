export interface TabEvent {
  key: string;
  event: string;
  callback: EventCallback;
}

export interface EventEmit {
  key?: string;
  event: string;
  payload?: unknown;
}

export type EventCallback = (payload: unknown) => void;

export class EventEmitter {
  private subscribers = new Map<string, Map<string, Set<EventCallback>>>();

  subscribe({ key, event, callback }: TabEvent) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Map());
    }

    const events = this.subscribers.get(key)!;
    if (!events.has(event)) {
      events.set(event, new Set());
    }

    events.get(event)!.add(callback);
  }

  unsubscribe(key: string, event?: string, callback?: EventCallback) {
    if (!this.subscribers.has(key)) return;

    const events = this.subscribers.get(key)!;
    if (event) {
      if (!events.has(event)) return;

      const callbacks = events.get(event)!;
      if (callback) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          events.delete(event);
        }
      }
    } else {
      this.subscribers.delete(key);
    }
  }

  emit({ key, event, payload }: EventEmit) {
    if (key) {
      const callbacks = this.subscribers.get(key);
      if (!callbacks || !callbacks.has(event)) {
        console.warn(
          `Unable to send event "${event}" to tab "${key}". Tab does not exist or has no listeners.`
        );
        return;
      }

      callbacks.get(event)!.forEach((callback) => callback(payload));
    } else {
      this.subscribers.forEach((events) => {
        events.get(event)?.forEach((callback) => callback(payload));
      });
    }
  }
}
