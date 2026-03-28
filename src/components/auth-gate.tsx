
'use client';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();

    useEffect(() => {
        if (!isUserLoading && !user) {
            initiateAnonymousSignIn(auth);
        }
    }, [isUserLoading, user, auth]);

    // The loading skeleton has been moved to the page level (e.g., src/app/page.tsx)
    // to prevent hydration errors. This component's only job is to ensure
    // an anonymous user is created if no user is logged in.
    return <>{children}</>;
}
