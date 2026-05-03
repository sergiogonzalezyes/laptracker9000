import { useEffect, useRef } from 'react';

type Handler = (data: unknown) => void;

export function useSSE(url: string, handlers: Record<string, Handler>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let es: EventSource;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource(url);

      for (const event of Object.keys(handlersRef.current)) {
        es.addEventListener(event, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            handlersRef.current[event]?.(data);
          } catch {
            handlersRef.current[event]?.(e.data);
          }
        });
      }

      es.onerror = () => {
        es.close();
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [url]);
}
