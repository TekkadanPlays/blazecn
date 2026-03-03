import { Component } from 'inferno';
import { createElement } from 'inferno-create-element';
import { cn } from './utils';

// ---------------------------------------------------------------------------
// Toast system for InfernoJS — clean rewrite
//
// Design principles:
//   1. ONE source of truth: Toaster owns the toast array. Period.
//   2. NO cross-component height sharing — Toaster measures after every
//      render and computes offsets from the DOM directly.
//   3. Each toast has a simple lifecycle: enter → visible → exit → remove.
//      States never overlap.
//   4. Timers live on the Toaster, not individual items. No stale closures.
//   5. CSS handles all animation via transitions on transform/opacity.
// ---------------------------------------------------------------------------

const TOAST_LIFETIME = 4000;
const MAX_VISIBLE = 3;
const MAX_EXPANDED = 5;  // max toasts shown when hovered/expanded
const GAP = 14;
const EXIT_DURATION = 300;
const TOAST_WIDTH = 356;
const VIEWPORT_OFFSET = 32;

export type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning' | 'loading';
export type ToasterPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  id: string | number;
  type: ToastType;
  title?: string;
  description?: string;
  action?: ToastAction;
  cancel?: ToastAction;
  duration?: number;
  dismissible?: boolean;
}

// ---------------------------------------------------------------------------
// Internal extended type — tracks lifecycle state per toast
// ---------------------------------------------------------------------------

interface InternalToast extends ToastData {
  phase: 'enter' | 'visible' | 'exit';
  createdAt: number;
  remaining: number;   // ms left on auto-dismiss clock
  pausedAt: number;    // timestamp when timer was paused, 0 if running
}

// ---------------------------------------------------------------------------
// Observer — minimal pub/sub between toast() calls and Toaster
// ---------------------------------------------------------------------------

type ToastEvent =
  | { kind: 'add'; toast: ToastData }
  | { kind: 'update'; toast: ToastData }
  | { kind: 'dismiss'; id: string | number }
  | { kind: 'dismiss-all' };

type Subscriber = (event: ToastEvent) => void;

let idCounter = 1;

class Observer {
  private subs: Subscriber[] = [];

  subscribe(fn: Subscriber): () => void {
    this.subs.push(fn);
    return () => { this.subs = this.subs.filter((s) => s !== fn); };
  }

  private emit(event: ToastEvent) {
    for (const fn of this.subs) fn(event);
  }

  create(data: Partial<ToastData> & { message?: string }): string | number {
    const { message, ...rest } = data;
    const id = data.id ?? idCounter++;
    const dismissible = data.dismissible ?? true;
    const toastData: ToastData = {
      id,
      type: rest.type || 'default',
      title: message,
      description: rest.description,
      action: rest.action,
      cancel: rest.cancel,
      duration: rest.duration,
      dismissible,
    };

    // If an id was explicitly provided, try to update in-place
    if (data.id !== undefined) {
      this.emit({ kind: 'update', toast: toastData });
    } else {
      this.emit({ kind: 'add', toast: toastData });
    }
    return id;
  }

  dismiss(id?: string | number) {
    if (id !== undefined) {
      this.emit({ kind: 'dismiss', id });
    } else {
      this.emit({ kind: 'dismiss-all' });
    }
  }

  promise<T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string },
  ): Promise<T> {
    const id = this.create({ message: msgs.loading, type: 'loading', duration: Infinity });
    promise
      .then(() => this.create({ id, message: msgs.success, type: 'success', duration: TOAST_LIFETIME }))
      .catch(() => this.create({ id, message: msgs.error, type: 'error', duration: TOAST_LIFETIME }));
    return promise;
  }
}

const observer = new Observer();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

interface ToastOptions {
  description?: string;
  action?: ToastAction;
  cancel?: ToastAction;
  duration?: number;
  id?: string | number;
}

function toastFn(title: string, opts?: ToastOptions): string | number {
  return observer.create({ message: title, ...opts });
}

export const toast = Object.assign(toastFn, {
  success: (title: string, opts?: ToastOptions) => observer.create({ ...opts, message: title, type: 'success' as ToastType }),
  error:   (title: string, opts?: ToastOptions) => observer.create({ ...opts, message: title, type: 'error'   as ToastType }),
  info:    (title: string, opts?: ToastOptions) => observer.create({ ...opts, message: title, type: 'info'    as ToastType }),
  warning: (title: string, opts?: ToastOptions) => observer.create({ ...opts, message: title, type: 'warning' as ToastType }),
  loading: (title: string, opts?: ToastOptions) => observer.create({ ...opts, message: title, type: 'loading' as ToastType }),
  dismiss: (id?: string | number) => observer.dismiss(id),
  promise: observer.promise.bind(observer),
});

export function dismissToast(id: string | number) {
  observer.dismiss(id);
}

// ---------------------------------------------------------------------------
// Type icons
// ---------------------------------------------------------------------------

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'default') return null;

  const svgBase = {
    className: 'size-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };

  let icon: any = null;

  if (type === 'loading') {
    icon = createElement('svg', { ...svgBase, className: 'size-4 animate-spin' },
      createElement('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }),
    );
  } else if (type === 'success') {
    icon = createElement('svg', svgBase,
      createElement('circle', { cx: '12', cy: '12', r: '10' }),
      createElement('path', { d: 'm9 12 2 2 4-4' }),
    );
  } else if (type === 'error') {
    icon = createElement('svg', svgBase,
      createElement('path', { d: 'M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z' }),
      createElement('path', { d: 'm15 9-6 6' }),
      createElement('path', { d: 'm9 9 6 6' }),
    );
  } else if (type === 'info') {
    icon = createElement('svg', svgBase,
      createElement('circle', { cx: '12', cy: '12', r: '10' }),
      createElement('path', { d: 'M12 16v-4' }),
      createElement('path', { d: 'M12 8h.01' }),
    );
  } else if (type === 'warning') {
    icon = createElement('svg', svgBase,
      createElement('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }),
      createElement('path', { d: 'M12 9v4' }),
      createElement('path', { d: 'M12 17h.01' }),
    );
  }

  if (!icon) return null;

  return createElement('div', {
    className: 'flex items-center justify-center shrink-0',
    style: { width: '16px', height: '16px' },
  }, icon);
}

// ---------------------------------------------------------------------------
// Toaster — the ONLY stateful component. Owns everything.
//
// All positioning is done with absolute positioning + transform.
// Expanded (hover) mode: each toast offset = sum of measured heights above it.
// Collapsed mode: front toast at offset 0, others peeking behind with scale.
// ---------------------------------------------------------------------------

interface ToasterProps {
  position?: ToasterPosition;
}

interface ToasterState {
  toasts: InternalToast[];
  hovered: boolean;
}

export class Toaster extends Component<ToasterProps, ToasterState> {
  declare state: ToasterState;
  private unsub: (() => void) | null = null;
  private tickId: ReturnType<typeof setInterval> | null = null;
  private exitTimers = new Set<string | number>();
  private heights = new Map<string | number, number>();
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;
  private hoverHeightFloor = 0; // never shrink wrapper during a hover session

  constructor(props: ToasterProps) {
    super(props);
    this.state = { toasts: [], hovered: false };
  }

  componentDidMount() {
    this.unsub = observer.subscribe((event) => this.handleEvent(event));
    this.tickId = setInterval(() => this.tick(), 50);
  }

  componentWillUnmount() {
    this.unsub?.();
    if (this.tickId) clearInterval(this.tickId);
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
    this.exitTimers.clear();
    this.heights.clear();
  }

  componentDidUpdate() {
    this.measureHeights();
  }

  private measureHeights() {
    const ol = (this as any)._listRef as HTMLOListElement | null;
    if (!ol) return;
    const items = ol.querySelectorAll('[data-toast-id]');
    items.forEach((el: Element) => {
      const rawId = el.getAttribute('data-toast-id')!;
      const id: string | number = /^\d+$/.test(rawId) ? Number(rawId) : rawId;
      const h = (el as HTMLElement).getBoundingClientRect().height;
      if (h > 0) this.heights.set(id, h);
    });
  }

  // Debounced hover: enter immediately, leave after a short delay.
  // This prevents flicker when the cursor crosses gaps between toasts
  // or when a toast exits and the DOM reflows.
  private onHoverEnter = () => {
    if (this.leaveTimer) { clearTimeout(this.leaveTimer); this.leaveTimer = null; }
    if (!this.state.hovered) {
      this.hoverHeightFloor = 0; // reset floor on fresh hover
      this.setState({ hovered: true });
    }
  };

  private onHoverLeave = () => {
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
    this.leaveTimer = setTimeout(() => {
      this.leaveTimer = null;
      this.hoverHeightFloor = 0;
      this.setState({ hovered: false });
    }, 150); // 150ms debounce survives toast exit reflows
  };

  // -----------------------------------------------------------------------
  // Event handler
  // -----------------------------------------------------------------------

  private handleEvent = (event: ToastEvent) => {
    const now = Date.now();

    if (event.kind === 'add') {
      const d = event.toast;
      const internal: InternalToast = {
        ...d,
        phase: 'enter',
        createdAt: now,
        remaining: d.duration ?? TOAST_LIFETIME,
        pausedAt: 0,
      };
      this.setState((s) => ({ toasts: [internal, ...s.toasts] }));
      requestAnimationFrame(() => {
        this.setState((s) => ({
          toasts: s.toasts.map((t) =>
            t.id === d.id && t.phase === 'enter' ? { ...t, phase: 'visible' as const } : t,
          ),
        }));
      });
      return;
    }

    if (event.kind === 'update') {
      const d = event.toast;
      this.setState((s) => {
        const idx = s.toasts.findIndex((t) => t.id === d.id);
        if (idx === -1) {
          // Not found — treat as add
          const internal: InternalToast = {
            ...d, phase: 'enter', createdAt: now,
            remaining: d.duration ?? TOAST_LIFETIME, pausedAt: 0,
          };
          requestAnimationFrame(() => {
            this.setState((s2) => ({
              toasts: s2.toasts.map((t) =>
                t.id === d.id && t.phase === 'enter' ? { ...t, phase: 'visible' as const } : t,
              ),
            }));
          });
          return { toasts: [internal, ...s.toasts] };
        }
        const existing = s.toasts[idx];
        const wasLoading = existing.type === 'loading' && d.type !== 'loading';
        const newRemaining = wasLoading
          ? (d.duration ?? TOAST_LIFETIME)
          : (d.duration !== undefined ? d.duration : existing.remaining);
        const updated = [...s.toasts];
        // Cancel any pending exit timer if we're reviving this toast
        if (existing.phase === 'exit') {
          this.exitTimers.delete(d.id);
        }
        updated[idx] = {
          ...existing, ...d,
          remaining: newRemaining,
          pausedAt: 0,
          createdAt: wasLoading ? now : existing.createdAt,
          phase: existing.phase === 'exit' ? 'visible' as const : existing.phase,
        };
        return { toasts: updated };
      });
      return;
    }

    if (event.kind === 'dismiss') {
      this.scheduleExit(event.id);
      return;
    }

    if (event.kind === 'dismiss-all') {
      this.setState((s) => ({
        toasts: s.toasts.map((t) => t.phase !== 'exit' ? { ...t, phase: 'exit' as const } : t),
      }));
      // Collect all IDs for cleanup
      for (const t of this.state.toasts) {
        if (!this.exitTimers.has(t.id)) {
          this.exitTimers.add(t.id);
          setTimeout(() => this.removeToast(t.id), EXIT_DURATION);
        }
      }
    }
  };

  // -----------------------------------------------------------------------
  // Timer tick
  // -----------------------------------------------------------------------

  private tick() {
    const now = Date.now();
    const { hovered, toasts } = this.state;
    let changed = false;

    const next = toasts.map((t) => {
      if (t.phase === 'exit' || t.phase === 'enter') return t;
      if (t.type === 'loading' || t.remaining === Infinity) return t;

      // Pause on hover
      if (hovered) {
        if (t.pausedAt === 0) {
          changed = true;
          return { ...t, pausedAt: now };
        }
        return t;
      }

      // Resume after hover
      if (t.pausedAt > 0) {
        changed = true;
        return { ...t, pausedAt: 0, createdAt: now };
      }

      // Check expiry
      const elapsed = now - t.createdAt;
      if (elapsed >= t.remaining) {
        changed = true;
        // Schedule exit removal (only once)
        if (!this.exitTimers.has(t.id)) {
          this.exitTimers.add(t.id);
          setTimeout(() => this.removeToast(t.id), EXIT_DURATION);
        }
        return { ...t, phase: 'exit' as const };
      }

      return t;
    });

    if (changed) {
      this.setState({ toasts: next });
    }
  }

  // -----------------------------------------------------------------------
  // Exit + removal helpers
  // -----------------------------------------------------------------------

  private scheduleExit(id: string | number) {
    if (this.exitTimers.has(id)) return; // already exiting
    this.exitTimers.add(id);
    this.setState((s) => ({
      toasts: s.toasts.map((t) =>
        t.id === id && t.phase !== 'exit' ? { ...t, phase: 'exit' as const } : t,
      ),
    }));
    setTimeout(() => this.removeToast(id), EXIT_DURATION);
  }

  private removeToast(id: string | number) {
    this.exitTimers.delete(id);
    this.heights.delete(id);
    this.setState((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    }));
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  // Compute total expanded stack height. Uses a floor that never shrinks
  // during the current hover session, preventing the wrapper from
  // collapsing below the cursor when a toast exits.
  private getStableExpandedHeight(toasts: InternalToast[]): number {
    const count = Math.min(toasts.filter((t) => t.phase !== 'exit').length, MAX_EXPANDED);
    let total = 0;
    let shown = 0;
    for (const t of toasts) {
      if (t.phase === 'exit') continue;
      if (shown >= count) break;
      total += (this.heights.get(t.id) ?? 56) + (shown > 0 ? GAP : 0);
      shown++;
    }
    total += GAP; // breathing room at the edge
    // Never shrink during a hover session
    if (total > this.hoverHeightFloor) this.hoverHeightFloor = total;
    return this.hoverHeightFloor;
  }

  render() {
    const { toasts, hovered } = this.state;
    const pos = this.props.position || 'bottom-right';
    const [yPos, xPos] = pos.split('-');
    const isTop = yPos === 'top';

    // Position styles shared between the ol and the hover overlay
    const anchor: Record<string, string> = {
      position: 'fixed',
      width: `${TOAST_WIDTH}px`,
      ...(isTop ? { top: `${VIEWPORT_OFFSET}px` } : { bottom: `${VIEWPORT_OFFSET}px` }),
      ...(xPos === 'left'
        ? { left: `${VIEWPORT_OFFSET}px` }
        : xPos === 'center'
          ? { left: '50%', transform: 'translateX(-50%)' }
          : { right: `${VIEWPORT_OFFSET}px` }),
    };

    return createElement('section', {
      'aria-label': 'Notifications',
      tabIndex: -1,
      'aria-live': 'polite',
      style: { position: 'fixed', zIndex: 999999999, pointerEvents: 'none' },
    },
      toasts.length > 0
        ? createElement('div', {
            // This wrapper catches all mouse events for the entire toast region.
            // It's sized to cover the full stack area so cursor movement between
            // absolute-positioned toasts (gap space) doesn't trigger leave/enter.
            onMouseEnter: this.onHoverEnter,
            onMouseLeave: this.onHoverLeave,
            style: {
              ...anchor,
              height: hovered
                ? `${this.getStableExpandedHeight(toasts)}px`
                : `${(this.heights.get(toasts[0]?.id) ?? 56) + MAX_VISIBLE * 6 + GAP}px`,
              pointerEvents: 'auto',
              // Debug: uncomment to see the hover zone
              // background: 'rgba(255,0,0,0.08)',
            } as any,
          },
            createElement('ol', {
              ref: (el: HTMLOListElement | null) => { (this as any)._listRef = el; },
              style: {
                position: 'absolute',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                width: '100%',
                ...(isTop ? { top: 0 } : { bottom: 0 }),
              } as any,
            },
              ...toasts.map((t, index) => this.renderToast(t, index, toasts, isTop, hovered)),
            ),
          )
        : null,
    );
  }

  private renderToast(t: InternalToast, index: number, all: InternalToast[], isTop: boolean, hovered: boolean) {
    const total = all.length;
    const isExiting = t.phase === 'exit';
    const isEntering = t.phase === 'enter';

    // Compute a "live index" that ignores exiting toasts.
    // This prevents follow-up toasts from inheriting dead space
    // when the toast that triggered them is still animating out.
    let liveIndex = 0;
    for (let i = 0; i < index; i++) {
      if (all[i].phase !== 'exit') liveIndex++;
    }

    // Expanded offset: sum of heights of LIVE toasts in front only
    let expandedOffset = 0;
    for (let i = 0; i < index; i++) {
      if (all[i].phase === 'exit') continue;
      const h = this.heights.get(all[i].id) ?? 56;
      expandedOffset += h + GAP;
    }

    // Cap offset: sum of heights of first MAX_EXPANDED live toasts
    let capOffset = 0;
    let capCount = 0;
    for (const toast of all) {
      if (toast.phase === 'exit') continue;
      if (capCount >= MAX_EXPANDED) break;
      capOffset += (this.heights.get(toast.id) ?? 56) + (capCount > 0 ? GAP : 0);
      capCount++;
    }

    let transform: string;
    let opacity: number;
    const zIndex = total - index;
    const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
    let transition = `transform 300ms ${easing}, opacity 200ms ease`;

    const PEEK = 6;
    const SCALE = 0.02;

    if (isEntering) {
      transform = isTop ? 'translateY(-80px)' : 'translateY(80px)';
      opacity = 0;
      transition = 'none';
    } else if (isExiting) {
      // Slide away from anchor edge
      transform = isTop
        ? `translateY(${-(expandedOffset + 80)}px)`
        : `translateY(${expandedOffset + 80}px)`;
      opacity = 0;
    } else if (hovered && liveIndex < MAX_EXPANDED) {
      // Expanded: visible toasts stack with measured heights
      const y = isTop ? expandedOffset : -expandedOffset;
      transform = `translateY(${y}px)`;
      // Soft fade on the last expanded toast (tail fade)
      if (liveIndex === MAX_EXPANDED - 1 && capCount >= MAX_EXPANDED) {
        opacity = 0.5;
      } else {
        opacity = 1;
      }
    } else if (hovered && liveIndex >= MAX_EXPANDED) {
      // Beyond expanded cap: parked at cap offset, invisible
      const y = isTop ? capOffset : -capOffset;
      transform = `translateY(${y}px)`;
      opacity = 0;
    } else if (liveIndex === 0 && !isExiting) {
      // Front toast — sits at anchor
      transform = 'translateY(0)';
      opacity = 1;
    } else if (liveIndex < MAX_VISIBLE && !isExiting) {
      // Collapsed peek behind front
      const peekY = (isTop ? 1 : -1) * liveIndex * PEEK;
      const scale = 1 - liveIndex * SCALE;
      transform = `translateY(${peekY}px) scale(${scale})`;
      opacity = 1;
    } else {
      // Hidden (beyond MAX_VISIBLE or exiting without explicit exit branch)
      const clamp = Math.min(liveIndex, MAX_VISIBLE - 1);
      const peekY = (isTop ? 1 : -1) * clamp * PEEK;
      const scale = 1 - clamp * SCALE;
      transform = `translateY(${peekY}px) scale(${scale})`;
      opacity = 0;
    }

    return createElement('li', {
      key: t.id,
      'data-toast-id': String(t.id),
      role: 'alert',
      className: 'group',
      style: {
        position: 'absolute',
        width: '100%',
        ...(isTop ? { top: 0 } : { bottom: 0 }),
        zIndex,
        transform,
        opacity,
        transition,
        transformOrigin: isTop ? 'top center' : 'bottom center',
        pointerEvents: isExiting ? 'none' : 'auto',
      } as any,
    },
      createElement('div', {
        className: 'relative flex w-full items-center gap-2 overflow-hidden rounded-xl border p-4 shadow-lg',
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          borderColor: 'var(--border)',
          fontSize: '13px',
        },
      },
        createElement(ToastIcon, { type: t.type }),

        createElement('div', { className: 'flex flex-col gap-0.5 flex-1 min-w-0' },
          t.title
            ? createElement('div', { className: 'font-medium leading-snug' }, t.title)
            : null,
          t.description
            ? createElement('div', { className: 'text-muted-foreground leading-snug', style: { fontSize: '12px' } }, t.description)
            : null,
          (t.action || t.cancel)
            ? createElement('div', { className: 'flex items-center gap-2 mt-1.5' },
                t.action
                  ? createElement('button', {
                      type: 'button',
                      onClick: () => { t.action!.onClick(); this.scheduleExit(t.id); },
                      className: 'inline-flex items-center justify-center rounded-md text-xs font-medium h-6 px-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
                    }, t.action.label)
                  : null,
                t.cancel
                  ? createElement('button', {
                      type: 'button',
                      onClick: () => { t.cancel!.onClick(); this.scheduleExit(t.id); },
                      className: 'inline-flex items-center justify-center rounded-md text-xs font-medium h-6 px-2 border hover:bg-accent transition-colors',
                      style: { borderColor: 'var(--border)', background: 'var(--popover)' },
                    }, t.cancel.label)
                  : null,
              )
            : null,
        ),

        (t.dismissible !== false)
          ? createElement('button', {
              type: 'button',
              onClick: () => this.scheduleExit(t.id),
              className: cn(
                'absolute top-1.5 right-1.5 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100',
                'outline-none focus-visible:opacity-100 focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'hover:text-foreground text-muted-foreground/60',
              ),
              'aria-label': 'Dismiss',
            },
              createElement('svg', {
                className: 'size-3.5',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2.5',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
              },
                createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
                createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
              ),
            )
          : null,
      ),
    );
  }
}
