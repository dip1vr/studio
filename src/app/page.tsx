"use client";

import { useUser } from '@/firebase';
import { Dashboard } from '@/components/dashboard';
import { LandingPage } from '@/components/landing-page';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-semibold">Vidyarthi Vista</h2>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  // Show landing page for guests/anonymous users, dashboard for logged-in users
  if (!user || user.isAnonymous) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
