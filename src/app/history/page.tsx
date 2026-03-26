
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { TestResult } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function HistoryPage() {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const allHistory = Object.keys(localStorage)
      .filter(key => key.startsWith('test_result_'))
      .map(key => JSON.parse(localStorage.getItem(key)!))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistory(allHistory);
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="container mx-auto py-12 text-center">Loading...</div>;
  }
  
  if (history.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Test History Found</CardTitle>
            <CardDescription>You haven't completed any tests yet. Start a new test to see your progress here.</CardDescription>
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
  
  const chartData = history.slice(0, 10).reverse().map(result => ({
    name: format(new Date(result.date), 'MMM d'),
    score: result.score,
    accuracy: result.accuracy,
  }));

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
                  <TableCell>{format(new Date(result.date), 'PPP')}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
