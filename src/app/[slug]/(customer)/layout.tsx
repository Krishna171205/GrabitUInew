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
        {/* Phone column by default. A screen that has a desktop layout marks itself
            .gb-wide and the shell lets go of the cap (see globals.css). */}
        <div className="gb-cust-shell">
          {children}
        </div>
      </div>
    </QueryClientProvider>
  );
}
