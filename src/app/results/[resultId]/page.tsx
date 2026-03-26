
"use client";
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Clock, BarChart2, Lightbulb } from 'lucide-react';

import type { TestResult, TestSession } from '@/lib/types';
import { offerPersonalizedStudySuggestions } from '@/ai/flows/offer-personalized-study-suggestions';

const COLORS = {
  correct: 'hsl(var(--chart-2))',
  incorrect: 'hsl(var(--destructive))',
  skipped: 'hsl(var(--muted-foreground))',
};

export default function ResultPage({ params }: { params: { resultId: string } }) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const resultData = localStorage.getItem(`test_result_${params.resultId}`);
    const sessionData = localStorage.getItem(`test_session_${params.resultId}`);
    if (resultData) {
      const parsedResult: TestResult = JSON.parse(resultData);
      setResult(parsedResult);
      if(sessionData) {
        const parsedSession: TestSession = JSON.parse(sessionData);
        setSession(parsedSession);
      }
      
      if (parsedResult.performanceBreakdown && parsedResult.performanceBreakdown.length > 0) {
        const suggestionPayload = {
          totalQuestions: parsedResult.totalQuestions,
          correctAnswers: parsedResult.correctAnswers,
          incorrectAnswers: parsedResult.incorrectAnswers,
          skippedQuestions: parsedResult.skipped,
          overallAccuracy: parsedResult.accuracy,
          performanceBreakdown: parsedResult.performanceBreakdown.map(p => ({
            categoryType: parsedResult.config.topic ? 'topic' as const : 'subject' as const,
            categoryName: p.category,
            correctCount: p.correctCount,
            incorrectCount: p.incorrectCount,
            accuracy: p.accuracy,
          }))
        };
        
        offerPersonalizedStudySuggestions(suggestionPayload).then(res => {
            setSuggestions(res.tips);
        }).catch(err => {
            console.error("Failed to get AI suggestions:", err);
            // Fail silently, don't show an error to the user.
        });
      }
    }
    setIsMounted(true);
  }, [params.resultId]);

  if (!isMounted) {
    return <div className="container mx-auto py-12 text-center">Loading results...</div>;
  }

  if (!result || !session) {
    notFound();
  }

  const pieData = [
    { name: 'Correct', value: result.correctAnswers },
    { name: 'Incorrect', value: result.incorrectAnswers },
    { name: 'Skipped', value: result.skipped },
  ];
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Test Report: {result.config.exam}</CardTitle>
          <CardDescription>Analysis of your performance on {new Date(result.date).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Final Score</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{result.score.toFixed(2)} / {result.totalQuestions}</div>
                    <p className="text-xs text-muted-foreground">Marks obtained vs Total marks</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{result.accuracy.toFixed(2)}%</div>
                     <p className="text-xs text-muted-foreground">({result.correctAnswers} correct out of {result.correctAnswers + result.incorrectAnswers} attempted)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatTime(result.timeTaken)}</div>
                    <p className="text-xs text-muted-foreground">Time limit was {result.config.timeLimit ? `${result.config.timeLimit}m` : 'none'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{suggestions.length > 0 ? "Available" : (result.performanceBreakdown && result.performanceBreakdown.length > 0 ? "Generating..." : "N/A")}</div>
                    <p className="text-xs text-muted-foreground">Personalized improvement tips</p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                   {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Study Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 list-disc pl-5">
                {suggestions.map((tip, i) => <li key={i} className="text-muted-foreground">{tip}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question-by-Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {session.questions.map((q, i) => {
              const userAnswer = session.userAnswers[i];
              const isCorrect = userAnswer.selectedOption === q.correctAnswerIndex;
              const answeredIncorrectly = userAnswer.selectedOption !== undefined && !isCorrect;

              return (
                <AccordionItem value={`item-${i}`} key={i}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 w-full pr-4">
                      {isCorrect ? <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0"/> : answeredIncorrectly ? <XCircle className="text-red-500 h-5 w-5 flex-shrink-0"/> : <AlertCircle className="text-yellow-500 h-5 w-5 flex-shrink-0"/>}
                      <span className="text-left flex-1">Question {i+1}: {q.questionText.substring(0, 80)}...</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="font-semibold">{q.questionText}</p>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer.selectedOption === optIndex;
                        const isCorrectAnswer = q.correctAnswerIndex === optIndex;
                        return (
                          <div key={optIndex} className={`p-3 rounded-md border-2 ${
                            isCorrectAnswer ? 'border-green-500 bg-green-500/10' : 
                            isUserAnswer && !isCorrect ? 'border-red-500 bg-red-500/10' : 'border-border'
                          }`}>
                            <p>
                              {isUserAnswer && (isCorrect ? '✅ ' : '❌ ')}
                              {!isUserAnswer && isCorrectAnswer && '✅ '}
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-lg">Explanation</CardTitle></CardHeader>
                        <CardContent><p>{q.explanation}</p></CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button asChild>
            <Link href="/test/new">Take Another Test</Link>
        </Button>
      </div>

    </div>
  );
}
