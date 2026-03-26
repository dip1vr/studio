import { TestSetupForm } from '@/components/test-setup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewTestPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create a New Mock Test</CardTitle>
          <CardDescription>
            Customize your test settings and let our AI generate a unique set of questions for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestSetupForm />
        </CardContent>
      </Card>
    </div>
  );
}
