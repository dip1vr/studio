
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Bookmark, Circle, CheckCircle, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Palette content extracted into its own component for reuse
const PaletteContent = ({
  session,
  currentQuestionIndex,
  onQuestionSelect,
  onSubmit,
}: {
  session: TestSession;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  onSubmit: () => void;
}) => {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="md:hidden mb-4">
        <SheetTitle>Question Palette</SheetTitle>
      </SheetHeader>
      <h3 className="hidden md:block text-lg font-semibold mb-4 text-center">Question Palette</h3>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-5 gap-2 pr-2">
          {session.questions.map((_, index) => {
            const status = session.userAnswers[index].status;
            let statusClass = '';
            switch (status) {
              case 'answered': statusClass = 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400'; break;
              case 'not-answered': statusClass = 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400'; break;
              case 'marked-for-review': statusClass = 'bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-400'; break;
              case 'answered-and-marked-for-review': statusClass = 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-400'; break;
              default: statusClass = 'bg-muted hover:bg-muted/80 border';
            }
            return (
              <Button
                key={index}
                variant="outline"
                size="icon"
                onClick={() => onQuestionSelect(index)}
                className={cn(
                  'h-12 w-12 text-lg font-semibold transition-all',
                  statusClass,
                  index === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                )}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Answered</div>
        <div className="flex items-center gap-2"><Circle className="h-4 w-4 text-blue-500" /> Not Answered</div>
        <div className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-purple-500" /> Marked for Review</div>
        <div className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Answered & Marked</div>
        <div className="flex items-center gap-2"><Circle className="h-4 w-4 text-muted-foreground" /> Not Visited</div>
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
                  <AlertDialogAction onClick={onSubmit}>Submit Test</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


export function TestInterface({ testId }: { testId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
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

  const updateSessionState = (newSession: TestSession) => {
    setSession(newSession);
    localStorage.setItem(`test_session_${testId}`, JSON.stringify(newSession));
  }

  useEffect(() => {
    if(!session || session.userAnswers[currentQuestionIndex].status !== 'not-visited') {
      return;
    }
    const newAnswers = [...session.userAnswers];
    newAnswers[currentQuestionIndex].status = 'not-answered';
    updateSessionState({ ...session, userAnswers: newAnswers });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, session]);
  
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

  const updateAnswer = (questionIndex: number, selectedOption?: number, statusUpdate?: Partial<UserAnswer>) => {
    if (!session) return;
    const newAnswers = [...session.userAnswers];
    const currentAnswer = newAnswers[questionIndex];
    let newSession: TestSession;

    if (selectedOption !== undefined) {
        const newStatus = currentAnswer.status === 'marked-for-review' || currentAnswer.status === 'answered-and-marked-for-review' ? 'answered-and-marked-for-review' : 'answered';
        newAnswers[questionIndex] = { ...currentAnswer, selectedOption, status: newStatus };
        newSession = { ...session, userAnswers: newAnswers };
    } else if (statusUpdate) {
        newAnswers[questionIndex] = { ...currentAnswer, ...statusUpdate };
        newSession = { ...session, userAnswers: newAnswers };
    } else { // Clear response
        newAnswers[questionIndex] = { ...currentAnswer, selectedOption: undefined, status: 'not-answered' };
        newSession = { ...session, userAnswers: newAnswers };
    }

    updateSessionState(newSession);
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
    } else { // not-answered or not-visited
      newStatus = 'marked-for-review';
    }
    updateAnswer(currentQuestionIndex, undefined, { status: newStatus });
  };

  const clearResponse = () => {
      updateAnswer(currentQuestionIndex, undefined);
  };
  
  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsPaletteOpen(false); // Close sheet on selection
  };

  const currentQuestion: Question | undefined = session?.questions[currentQuestionIndex];
  const currentUserAnswer: UserAnswer | undefined = session?.userAnswers[currentQuestionIndex];

  if (!isMounted) return <div className="fixed inset-0 flex items-center justify-center bg-background">Loading Test...</div>;
  if (!session || !currentQuestion) {
      useEffect(() => notFound(), []);
      return null;
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-secondary/30">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8 h-full">
            <Card className="h-full flex flex-col shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className='flex-1'>
                    <p className='text-sm text-muted-foreground'>Question {currentQuestionIndex + 1} of {session.questions.length}</p>
                    <CardTitle className="text-xl md:text-2xl mt-1">
                      {session.config.exam}
                    </CardTitle>
                  </div>

                <div className='flex items-center gap-4'>
                    {timeLeft !== null && <div className="text-xl font-mono font-semibold tabular-nums text-right shrink-0"><span className="text-muted-foreground text-sm block">Time Left</span> {formatTime(timeLeft)}</div>}
                    <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <LayoutGrid className="h-5 w-5" />
                                <span className="sr-only">Open Question Palette</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] p-4 flex flex-col">
                            <PaletteContent session={session} currentQuestionIndex={currentQuestionIndex} onQuestionSelect={handleQuestionSelect} onSubmit={submitTest}/>
                        </SheetContent>
                    </Sheet>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-6 pt-0 md:pt-2">
                <p className="text-base md:text-lg font-semibold leading-relaxed">{currentQuestion.questionText}</p>
                <RadioGroup key={currentQuestionIndex} value={currentUserAnswer?.selectedOption?.toString()} onValueChange={handleOptionChange} className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <Label key={index} htmlFor={`option-${index}`} className={cn(
                            "flex items-start rounded-lg border p-4 transition-all cursor-pointer text-base",
                            "hover:border-primary hover:bg-primary/5",
                            currentUserAnswer?.selectedOption === index && "border-primary bg-primary/10 ring-2 ring-primary"
                         )}>
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-6 w-6 mt-0.5"/>
                            <span className="ml-4 font-medium flex-1">{option}</span>
                        </Label>
                    ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 border-t pt-6">
                <div className='flex gap-2 flex-wrap'>
                  <Button variant="outline" onClick={handleMarkForReview}><Bookmark className="mr-2 h-4 w-4"/>Mark for Review</Button>
                  <Button variant="ghost" onClick={clearResponse}>Clear Response</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} disabled={currentQuestionIndex === 0}><ChevronLeft className="mr-2 h-4 w-4"/>Previous</Button>
                  {currentQuestionIndex < session.questions.length - 1 ? (
                    <Button onClick={() => setCurrentQuestionIndex(p => Math.min(session.questions.length - 1, p + 1))}>Save & Next <ChevronRight className="ml-2 h-4 w-4"/></Button>
                  ) : (
                     <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="default">Review & Submit</Button></AlertDialogTrigger>
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
        </div>
      </main>
      <aside className="hidden md:flex w-80 border-l p-4 bg-card flex-col">
        <PaletteContent session={session} currentQuestionIndex={currentQuestionIndex} onQuestionSelect={handleQuestionSelect} onSubmit={submitTest}/>
      </aside>
    </div>
  );
}
