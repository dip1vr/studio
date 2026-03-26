
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import type { TestSession, UserAnswer, Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Bookmark, Sparkles } from 'lucide-react';

const getStatusColor = (status: UserAnswer['status']) => {
  switch (status) {
    case 'answered': return 'bg-green-500 hover:bg-green-600';
    case 'not-answered': return 'bg-red-500 hover:bg-red-600';
    case 'marked-for-review': return 'bg-purple-500 hover:bg-purple-600';
    case 'answered-and-marked-for-review': return 'bg-yellow-500 hover:bg-yellow-600';
    default: return 'bg-muted hover:bg-muted/80';
  }
};

export function TestInterface({ testId }: { testId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const sessionData = localStorage.getItem(`test_session_${testId}`);
    if (sessionData) {
      const parsedSession: TestSession = JSON.parse(sessionData);
      setSession(parsedSession);
      if (parsedSession.config.timeLimit) {
        const elapsedTime = Math.floor((Date.now() - parsedSession.startTime) / 1000);
        setTimeLeft(parsedSession.config.timeLimit * 60 - elapsedTime);
      }
    }
    setIsMounted(true);
  }, [testId]);
  
  const submitTest = useCallback(() => {
    if (!session) return;
    
    const endTime = Date.now();
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skipped = 0;

    session.questions.forEach((q, i) => {
        const userAnswer = session.userAnswers[i];
        if (userAnswer.selectedOption === undefined) {
            skipped++;
        } else if (userAnswer.selectedOption === q.correctAnswerIndex) {
            correctAnswers++;
        } else {
            incorrectAnswers++;
        }
    });
    
    const attempted = correctAnswers + incorrectAnswers;
    const accuracy = attempted > 0 ? (correctAnswers / attempted) * 100 : 0;
    
    let score = correctAnswers;
    if(session.config.negativeMarking && session.config.negativeMarkingRatio) {
        score -= incorrectAnswers * session.config.negativeMarkingRatio;
    }

    const performanceBreakdown: import('@/lib/types').PerformanceBreakdown[] = [];

    if (session.config.topic || session.config.subject) {
        const categoryName = session.config.topic || session.config.subject!;
        const attemptedInCategory = correctAnswers + incorrectAnswers;
        const accuracyInCategory = attemptedInCategory > 0 ? (correctAnswers / attemptedInCategory) * 100 : 0;
        
        performanceBreakdown.push({
            category: categoryName,
            accuracy: accuracyInCategory,
            correctCount: correctAnswers,
            incorrectCount: incorrectAnswers,
            skippedCount: skipped,
            totalCount: session.questions.length,
        });
    }

    const result: import('@/lib/types').TestResult = {
        id: session.id,
        config: session.config,
        score,
        accuracy,
        totalQuestions: session.questions.length,
        correctAnswers,
        incorrectAnswers,
        skipped,
        date: new Date(session.startTime).toISOString(),
        timeTaken: Math.floor((endTime - session.startTime) / 1000),
        performanceBreakdown,
    };
    
    localStorage.setItem(`test_result_${session.id}`, JSON.stringify(result));
    toast({ title: 'Test Submitted!', description: 'Your results have been calculated.' });
    router.replace(`/results/${session.id}`);

  }, [session, router]);


  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      submitTest();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => (t ?? 0) - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitTest]);

  const updateAnswer = (questionIndex: number, selectedOption?: number, status?: UserAnswer['status']) => {
    if (!session) return;
    const newAnswers = [...session.userAnswers];
    const currentAnswer = newAnswers[questionIndex];

    if(status) {
        newAnswers[questionIndex] = { ...currentAnswer, status };
    } else if (selectedOption !== undefined) {
        newAnswers[questionIndex] = { ...currentAnswer, selectedOption, status: currentAnswer.status === 'marked-for-review' || currentAnswer.status === 'answered-and-marked-for-review' ? 'answered-and-marked-for-review' : 'answered' };
    } else { // Clear response
        newAnswers[questionIndex] = { selectedOption: undefined, status: 'not-answered' };
    }

    const newSession = { ...session, userAnswers: newAnswers };
    setSession(newSession);
    localStorage.setItem(`test_session_${testId}`, JSON.stringify(newSession));
  };
  
  const handleOptionChange = (value: string) => {
    updateAnswer(currentQuestionIndex, parseInt(value));
  };

  const handleMarkForReview = () => {
    const currentStatus = session?.userAnswers[currentQuestionIndex].status;
    let newStatus: UserAnswer['status'];
    if (currentStatus === 'answered') {
      newStatus = 'answered-and-marked-for-review';
    } else if (currentStatus === 'answered-and-marked-for-review') {
      newStatus = 'answered';
    } else if (currentStatus === 'marked-for-review') {
      newStatus = 'not-visited';
    } else {
      newStatus = 'marked-for-review';
    }
    updateAnswer(currentQuestionIndex, undefined, newStatus);
  };

  const clearResponse = () => {
      updateAnswer(currentQuestionIndex, undefined);
  };
  
  const currentQuestion: Question | undefined = session?.questions[currentQuestionIndex];
  const currentUserAnswer: UserAnswer | undefined = session?.userAnswers[currentQuestionIndex];

  if (!isMounted) return <div className="fixed inset-0 flex items-center justify-center bg-background">Loading Test...</div>;
  if (!session || !currentQuestion) {
      // Allow notFound to work in client component
      useEffect(() => notFound(), []);
      return null;
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)]">
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Question {currentQuestionIndex + 1} of {session.questions.length}</CardTitle>
            {timeLeft !== null && <div className="text-xl font-mono font-semibold tabular-nums text-right"><span className="text-muted-foreground">Time Left:</span> {formatTime(timeLeft)}</div>}
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <p className="text-lg font-semibold leading-relaxed">{currentQuestion.questionText}</p>
            <RadioGroup value={currentUserAnswer?.selectedOption?.toString()} onValueChange={handleOptionChange}>
                {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">{option}</Label>
                    </div>
                ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className='flex gap-2'>
              <Button variant="outline" onClick={handleMarkForReview}><Bookmark className="mr-2 h-4 w-4"/>Mark for Review</Button>
              <Button variant="destructive" onClick={clearResponse}>Clear Response</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} disabled={currentQuestionIndex === 0}><ChevronLeft className="mr-2 h-4 w-4"/>Previous</Button>
              {currentQuestionIndex < session.questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(p => Math.min(session.questions.length - 1, p + 1))}><ChevronRight className="mr-2 h-4 w-4"/>Next</Button>
              ) : (
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="default">Submit Test</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will end the test and calculate your score. You cannot go back after submitting.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={submitTest}>Submit</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardFooter>
        </Card>
      </main>
      <aside className="w-full md:w-72 border-l p-4 bg-card flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Question Palette</h3>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
            {session.questions.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-12 w-12 text-lg font-semibold ${index === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2' : ''} ${getStatusColor(session.userAnswers[index].status)} text-white`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-green-500"/> Answered</div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-red-500"/> Not Answered</div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-purple-500"/> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-yellow-500"/> Answered & Marked</div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-muted border"/> Not Visited</div>
        </div>
         <AlertDialog>
            <AlertDialogTrigger asChild><Button className="w-full mt-4" variant="destructive">End Test</Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will end the test and calculate your score. You cannot go back after submitting.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={submitTest}>Submit Test</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </aside>
    </div>
  );
}
