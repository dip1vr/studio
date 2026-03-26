
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import type { TestSession, UserAnswer, Question, TestResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Bookmark, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const getStatusColor = (status: UserAnswer['status']) => {
  switch (status) {
    case 'answered': return 'bg-green-500 text-white hover:bg-green-600';
    case 'not-answered': return 'bg-blue-500 text-white hover:bg-blue-600';
    case 'marked-for-review': return 'bg-purple-500 text-white hover:bg-purple-600';
    case 'answered-and-marked-for-review': return 'bg-yellow-500 text-yellow-900 hover:bg-yellow-600';
    default: return 'bg-muted hover:bg-muted/80 border'; // not-visited
  }
};

export function TestInterface({ testId }: { testId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

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

  useEffect(() => {
    setSession(prevSession => {
        if (!prevSession || prevSession.userAnswers[currentQuestionIndex].status !== 'not-visited') {
            return prevSession;
        }
        const newAnswers = [...prevSession.userAnswers];
        newAnswers[currentQuestionIndex].status = 'not-answered';
        const newSession = { ...prevSession, userAnswers: newAnswers };
        localStorage.setItem(`test_session_${testId}`, JSON.stringify(newSession));
        return newSession;
    });
}, [currentQuestionIndex, testId]);
  
  const submitTest = useCallback(() => {
    if (!session || !user || !firestore) {
        if (!user) {
            toast({ title: 'Not Signed In', description: 'Please sign in to save your results.', variant: 'destructive'});
        }
        return;
    };
    
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

    const result: TestResult = {
        id: session.id,
        userId: user.uid,
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
    
    const finalSession: TestSession = { ...session, userId: user.uid, endTime: endTime };

    const resultRef = doc(firestore, 'users', user.uid, 'testResults', session.id);
    setDocumentNonBlocking(resultRef, result, { merge: false });

    const sessionRef = doc(firestore, 'users', user.uid, 'userTests', session.id);
    setDocumentNonBlocking(sessionRef, finalSession, { merge: false });
    
    localStorage.removeItem(`test_session_${session.id}`);

    toast({ title: 'Test Submitted! 🎉', description: 'Your results have been saved to your profile.' });
    router.replace(`/results/${session.id}`);

  }, [session, router, user, firestore]);


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
        newAnswers[questionIndex] = { ...currentAnswer, selectedOption: undefined, status: 'not-answered' };
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
      newStatus = 'not-answered';
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
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="h-6 w-6 text-primary" />
              Question {currentQuestionIndex + 1} of {session.questions.length}
            </CardTitle>
            {timeLeft !== null && <div className="text-xl font-mono font-semibold tabular-nums text-right"><span className="text-muted-foreground">Time Left:</span> {formatTime(timeLeft)}</div>}
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <p className="text-lg font-semibold leading-relaxed">{currentQuestion.questionText}</p>
            <RadioGroup key={currentQuestionIndex} value={currentUserAnswer?.selectedOption?.toString()} onValueChange={handleOptionChange} className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                    <Label key={index} htmlFor={`option-${index}`} className={cn(
                        "flex items-center rounded-lg border p-4 transition-all cursor-pointer text-base",
                        "hover:border-primary hover:bg-accent/50",
                        currentUserAnswer?.selectedOption === index && "border-primary bg-accent ring-2 ring-primary"
                     )}>
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-5 w-5"/>
                        <span className="ml-4 font-semibold">{String.fromCharCode(65 + index)}.</span>
                        <span className="ml-2 flex-1">{option}</span>
                    </Label>
                ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className='flex gap-2'>
              <Button variant="outline" onClick={handleMarkForReview}><Bookmark className="mr-2 h-4 w-4"/>Mark for Review</Button>
              <Button variant="ghost" onClick={clearResponse}>Clear Response</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} disabled={currentQuestionIndex === 0}><ChevronLeft className="mr-2 h-4 w-4"/>Previous</Button>
              {currentQuestionIndex < session.questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(p => Math.min(session.questions.length - 1, p + 1))}>Save & Next <ChevronRight className="ml-2 h-4 w-4"/></Button>
              ) : (
                 <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="default">Submit Test</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Ready to finish?</AlertDialogTitle>
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
      <aside className="w-full md:w-80 border-l p-4 bg-card flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-center">Question Palette</h3>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-6 md:grid-cols-5 gap-2">
            {session.questions.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-12 w-12 text-lg font-semibold transition-all ${index === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''} ${getStatusColor(session.userAnswers[index].status)}`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">✓</span> Answered</div>
            <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500"/> Not Answered</div>
            <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-white text-xs">🔖</span> Marked for Review</div>
            <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-yellow-900 text-xs">✍️</span> Answered & Marked</div>
            <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted border"/> Not Visited</div>
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
