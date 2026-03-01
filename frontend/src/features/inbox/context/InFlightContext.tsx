import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface InFlightItem {
    id: string;
    text: string;
    label: string;     // e.g. 'Procesando…' or 'Profundizando…'
    createdAt: number; // epoch ms
}

interface InFlightContextType {
    items: InFlightItem[];
    add: (text: string, label?: string) => string;       // returns id
    remove: (id: string) => void;
}

const InFlightContext = createContext<InFlightContextType>({
    items: [],
    add: () => '',
    remove: () => { },
});

let _nextId = 1;

export function InFlightProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [items, setItems] = useState<InFlightItem[]>([]);

    const add = useCallback((text: string, label = 'Procesando…') => {
        const id = `inflight-${_nextId++}`;
        setItems(prev => [...prev, { id, text, label, createdAt: Date.now() }]);
        return id;
    }, []);

    const remove = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const value = useMemo(() => ({ items, add, remove }), [items, add, remove]);

    return (
        <InFlightContext.Provider value={value}>
            {children}
        </InFlightContext.Provider>
    );
}

export function useInFlight() {
    return useContext(InFlightContext);
}
