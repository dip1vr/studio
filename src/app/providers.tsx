"use client";

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey="vidyarthi-vista-theme">
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
