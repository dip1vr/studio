
"use client";

import { useMemo } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { TestResult } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/testResults`), orderBy('takenAt', 'desc'));
  }, [user, firestore]);

  const { data: history, isLoading } = useCollection<TestResult>(historyQuery);

  const chartData = useMemo(() => {
    if (!history) return [];
    return history.slice(0, 10).reverse().map(result => ({
        name: format(new Date(result.takenAt), 'MMM d'),
        score: result.score,
        accuracy: result.accuracy,
    }));
  }, [history]);
  
  if (isLoading) {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <Skeleton className="h-12 w-1/3" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (!user || !history || history.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{user && !user.isAnonymous ? "No Test History Found" : "Sign In to See History"}</CardTitle>
            <CardDescription>
                {user && !user.isAnonymous 
                    ? "You haven't completed any tests yet. Start a new test to see your progress here." 
                    : "Sign in with your Google account to save and view your test history across devices."
                }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/test/new">Start a New Mock Test</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Test History</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Your scores and accuracy from the last 10 tests.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" label={{ value: 'Accuracy (%)', angle: -90, position: 'insideRight' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="score" fill="hsl(var(--primary))" name="Score" />
              <Bar yAxisId="right" dataKey="accuracy" fill="hsl(var(--accent))" name="Accuracy (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Completed Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Accuracy</TableHead>
                    <TableHead></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {history.map(result => (
                    <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.config.exam}</TableCell>
                    <TableCell>{format(new Date(result.takenAt), 'PPP')}</TableCell>
                    <TableCell className="text-right">{result.score.toFixed(2)} / {result.totalQuestions}</TableCell>
                    <TableCell className="text-right">{result.accuracy.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                        <Link href={`/results/${result.id}`}>View Report</Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
