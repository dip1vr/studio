"use client";

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey="vidyarthi-vista-theme">
      {children}
    </ThemeProvider>
  );
}
