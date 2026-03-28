import { TestSetupForm } from '@/components/test-setup-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTestPage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full bg-background text-foreground">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-primary/10 via-background to-background"></div>
      <div className="container mx-auto max-w-3xl py-8 md:py-12">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
              Configure Your Mock Test
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg mt-2">
              Fine-tune every detail to create the perfect practice session.
            </p>
        </div>
        <TestSetupForm />
      </div>
    </div>
  );
}
