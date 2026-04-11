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
      <div style={{ minHeight: '100vh', background: 'var(--g-white)' }}>
        {children}
      </div>
    </QueryClientProvider>
  );
}
