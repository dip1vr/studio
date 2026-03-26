import Link from 'next/link';
import { BookCopy, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <BookCopy className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block font-headline">
                Vidyarthi Vista
              </span>
            </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link href="/history">
                  <History className="h-4 w-4 md:mr-2" />
                  <span className='hidden md:inline'>History</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 md:mr-2" />
                  <span className='hidden md:inline'>Settings</span>
                </Link>
              </Button>
            </nav>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
        </div>
      </div>
    </header>
  );
}
