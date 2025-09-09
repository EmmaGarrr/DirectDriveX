export class Observable<T> {
  constructor(private subscriber: (observer: Observer<T>) => (() => void) | void) {}

  subscribe(observer: Observer<T> | ((value: T) => void)): Subscription {
    const obs = typeof observer === 'function' 
      ? { next: observer, error: () => {}, complete: () => {} }
      : observer;

    const cleanup = this.subscriber(obs);
    return { unsubscribe: cleanup || (() => {}) };
  }
}

export interface Observer<T> {
  next: (value: T) => void;
  error: (error: any) => void;
  complete: () => void;
}

export interface Subscription {
  unsubscribe: () => void;
}
