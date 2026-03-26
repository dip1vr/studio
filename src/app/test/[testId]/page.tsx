import { TestInterface } from '@/components/test-interface';

export default function TestPage({ params }: { params: { testId: string } }) {
  return <TestInterface testId={params.testId} />;
}
