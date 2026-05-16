// ---------------------------------------------------------------------------
// SignalBridge — bridges @preact/signals-core reactivity into InfernoJS
// Import { S } from 'blazecn' to wrap reactive subtrees.
// ---------------------------------------------------------------------------

import { Component } from 'inferno';
import { createElement } from 'inferno-create-element';
import { effect, signal, computed, batch } from '@preact/signals-core';
import type { Signal, ReadonlySignal } from '@preact/signals-core';

export { signal, computed, effect, batch };
export type { Signal, ReadonlySignal };

/**
 * SignalBridge component — subscribes to all signals read inside `children()`
 * via `effect()`, and calls `forceUpdate()` when any of them change.
 * Only the subtree returned by `children()` re-renders — surgical updates.
 */
class SignalBridge extends Component<{ children: () => any }, {}> {
  private dispose: (() => void) | null = null;
  private _mounted = false;

  componentDidMount() {
    this._mounted = true;
    this.dispose = effect(() => {
      this.props.children();
      if (this._mounted) this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this._mounted = false;
    this.dispose?.();
  }

  render() {
    return this.props.children();
  }
}

/**
 * S() — shorthand for wrapping a reactive render function in a SignalBridge.
 *
 * Usage:
 * ```ts
 * S(() => createElement('span', null, count.value))
 * ```
 *
 * Only the subtree inside S() re-renders when the signals it reads change.
 * Everything outside stays untouched. This is the core of surgical re-renders.
 */
export function S(fn: () => any) {
  return createElement(SignalBridge, { children: fn });
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/**
 * Create a signal that auto-persists to localStorage.
 * Reads initial value from storage, writes on every change.
 */
export function persistedSignal<T>(key: string, defaultValue: T): Signal<T> {
  let initial = defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) initial = JSON.parse(raw);
  } catch { /* use default */ }

  const sig = signal<T>(initial);

  // Auto-persist on changes
  effect(() => {
    localStorage.setItem(key, JSON.stringify(sig.value));
  });

  return sig;
}

/**
 * Create a signal that auto-persists a simple string to localStorage.
 */
export function persistedStringSignal(key: string, defaultValue: string): Signal<string> {
  const stored = localStorage.getItem(key);
  const sig = signal<string>(stored ?? defaultValue);

  effect(() => {
    localStorage.setItem(key, sig.value);
  });

  return sig;
}

/**
 * Create a signal that auto-persists a boolean to localStorage.
 */
export function persistedBoolSignal(key: string, defaultValue: boolean): Signal<boolean> {
  const stored = localStorage.getItem(key);
  const initial = stored !== null ? stored === 'true' : defaultValue;
  const sig = signal<boolean>(initial);

  effect(() => {
    localStorage.setItem(key, String(sig.value));
  });

  return sig;
}
