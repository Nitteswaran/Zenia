"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in production to reduce API noise
        refetchOnWindowFocus: process.env.NODE_ENV === "development",
        // Data is fresh for 30s before background refetch
        staleTime: 30 * 1000,
        // Keep cache for 5 minutes after last subscriber
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          // Never retry client errors (4xx)
          if (error instanceof Error) {
            const msg = error.message
            if (msg.includes("401") || msg.includes("403") || msg.includes("404") || msg.includes("402")) {
              return false
            }
          }
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Singleton on the browser — prevents QueryClient being recreated on every render
let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client (no state sharing between requests)
    return makeQueryClient()
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

// Keep ThemeProvider export for backward compat with existing imports
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </QueryClientProvider>
  )
}
