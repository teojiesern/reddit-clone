"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// passing the context using tanstack query is not as easy as slamming the queryClientProvider into the layout in nextjs, instead we will have to follow this approach
// tanstack query needs this context provider to work properly
// now this would be the top context provider that would wrap the whole application, after that if there are more context providers needed we can add them into here
export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
