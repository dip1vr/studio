
"use client";

import { useUser } from '@/firebase';
import { Dashboard } from '@/components/dashboard';
import { LandingPage } from '@/components/landing-page';

export default function HomePage() {
  const { user } = useUser();

  // Show dashboard for logged-in (non-anonymous) users, otherwise show landing page
  if (user && !user.isAnonymous) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
