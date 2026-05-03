import { useEffect, useRef } from 'react';
export function useSSE(url, handlers) {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;
    useEffect(() => {
        let es;
        let reconnectTimer;
        function connect() {
            es = new EventSource(url);
            for (const event of Object.keys(handlersRef.current)) {
                es.addEventListener(event, (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        handlersRef.current[event]?.(data);
                    }
                    catch {
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
