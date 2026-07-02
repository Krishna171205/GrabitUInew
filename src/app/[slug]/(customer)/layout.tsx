'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } }
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="gb-app">
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
          {children}
        </div>
      </div>
    </QueryClientProvider>
  );
}
