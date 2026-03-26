
'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { toast } from '@/hooks/use-toast';

const provider = new GoogleAuthProvider();

export function LoginButton() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignIn = () => {
    if (!auth) return;
    signInWithPopup(auth, provider).catch((error) => {
      console.error('Google sign-in error', error);
      toast({
        title: 'Sign-in Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    });
  };

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

  if (isUserLoading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (user && !user.isAnonymous) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
              />
              <AvatarFallback>
                {user.displayName?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={handleSignIn}>
      <LogIn className="mr-2 h-4 w-4" />
      Sign In
    </Button>
  );
}
