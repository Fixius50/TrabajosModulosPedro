import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

// Create a custom storage wrapper for idb-keyval to match AsyncStorage interface
const idbStorage = {
    getItem: async (key: string) => {
        const value = await get(key);
        return value ?? null;
    },
    setItem: async (key: string, value: string) => {
        await set(key, value);
    },
    removeItem: async (key: string) => {
        await del(key);
    },
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 3,
        },
    },
});

const persister = createAsyncStoragePersister({
    storage: idbStorage,
    key: 'REACT_QUERY_OFFLINE_CACHE',
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            {children}
        </PersistQueryClientProvider>
    );
};
