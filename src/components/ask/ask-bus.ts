/**
 * Tiny pub/sub so a page can open the floating chat without wrapping the
 * whole tree in a React context. The widget is the only subscriber.
 */
type Listener = (question?: string) => void;

const listeners = new Set<Listener>();

export function openAskGeorge(question?: string) {
  for (const notify of listeners) notify(question);
}

export function subscribeAskGeorge(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
