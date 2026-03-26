
"use client";

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { AuthGate } from '@/components/auth-gate';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey="vidyarthi-vista-theme">
      <FirebaseClientProvider>
        <AuthGate>
            {children}
        </AuthGate>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
