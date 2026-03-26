import { ResultPageClient } from '@/components/result-page';

export default function ResultPage({ params }: { params: { resultId: string } }) {
  return <ResultPageClient resultId={params.resultId} />;
}
