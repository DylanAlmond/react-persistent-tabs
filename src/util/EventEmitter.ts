export interface Event {
  key?: string;
  sender: string | null;
  event: string;
  payload?: unknown;
}

export interface ReceivedEvent {
  sender: string | null;
  payload?: unknown;
}

export type EventCallback = (e: ReceivedEvent) => void;

export class EventEmitter {
  private subscribers = new Map<string, Map<string, Set<EventCallback>>>();

  subscribe(key: string, event: string, callback: EventCallback) {
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

    console.log(events);

    if (event) {
      if (!events.has(event)) return;

      const callbacks = events.get(event)!;
      if (callback) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          events.delete(event);
        }
      } else {
        events.delete(event);
      }
    } else {
      this.subscribers.delete(key);
    }

    console.log(events);
  }

  emit({ key, sender, event, payload }: Event) {
    if (key) {
      const callbacks = this.subscribers.get(key);
      if (!callbacks || !callbacks.has(event)) {
        console.warn(
          `Unable to send event "${event}" to tab "${key}". Tab does not exist or has no listeners.`
        );
        return;
      }

      callbacks.get(event)!.forEach((callback) => callback({ sender, payload }));
    } else {
      this.subscribers.forEach((events) => {
        events.get(event)?.forEach((callback) => callback({ sender, payload }));
      });
    }
  }
}
