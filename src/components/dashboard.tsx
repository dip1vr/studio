
"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, BookOpen, Clock, Target, BarChart2, PlayCircle, Medal } from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { TestResult } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const StatCard = ({ icon, title, value, unit, delay }: { icon: React.ReactNode, title: string, value: string, unit: string, delay: number }) => (
    <Card 
        className="bg-white/5 border-white/10 backdrop-blur-lg shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8" 
        style={{ animationDelay: `${delay}ms`}}
    >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
            <div className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-lg">
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold text-white">{value}</div>
            <p className="text-xs text-slate-400">{unit}</p>
        </CardContent>
    </Card>
);

const DashboardSkeleton = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0c132c] to-[#121a3a] text-white p-4 sm:p-6 md:p-8">
        <main className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
            </div>
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Skeleton className="h-8 w-40 mb-4" />
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
                <div>
                     <Skeleton className="h-8 w-40 mb-4" />
                     <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </main>
    </div>
)

export function Dashboard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const resultsQuery = useMemoFirebase(() => {
        if (!user) return null;
        // Fetch all results without ordering to handle legacy data and avoid indexing issues.
        return query(collection(firestore, `users/${user.uid}/testResults`));
    }, [user, firestore]);
    
    const { data: rawResults, isLoading } = useCollection<TestResult | (Omit<TestResult, 'takenAt'> & { date: string })>(resultsQuery);

    const results = useMemo(() => {
        if (!rawResults) return null;
        return rawResults
            .map(r => ({
                ...r,
                takenAt: (r as TestResult).takenAt || (r as any).date || new Date(0).toISOString(),
            }))
            .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    }, [rawResults]);


    const stats = useMemo(() => {
        if (!results || results.length === 0) {
            return { testsTaken: 0, avgScore: 0, totalStudyTime: 0 };
        }
        const testsTaken = results.length;
        const avgScore = results.reduce((acc, r) => acc + r.accuracy, 0) / testsTaken;
        const totalStudyTime = results.reduce((acc, r) => acc + r.timeTaken, 0); // in seconds
        return {
            testsTaken,
            avgScore: parseFloat(avgScore.toFixed(1)),
            totalStudyTime: parseFloat((totalStudyTime / 3600).toFixed(1)), // in hours
        };
    }, [results]);

    const recentTests = useMemo(() => results?.slice(0, 3) || [], [results]);

    const weeklyProgress = useMemo(() => {
        if (!results) return [];
        const today = new Date();
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, i)).reverse();

        return last7Days.map(day => {
            const testsOnDay = results.filter(result => 
                isWithinInterval(new Date(result.takenAt), { start: startOfDay(day), end: endOfDay(day) })
            ).length;
            return {
                name: format(day, 'E'),
                tests: testsOnDay,
            };
        });
    }, [results]);

    const emptyImage = PlaceHolderImages.find(p => p.id === 'dashboard-empty');

    if (isLoading) {
        return <DashboardSkeleton />;
    }
    
    if (!results || results.length === 0) {
        return (
             <div className="min-h-screen w-full bg-gradient-to-br from-[#0c132c] to-[#121a3a] flex items-center justify-center p-4">
                 <Card className="bg-white/5 border-white/10 backdrop-blur-lg shadow-2xl text-center text-white max-w-2xl animate-in fade-in zoom-in-95 duration-500">
                     <CardHeader>
                         <CardTitle className="text-3xl font-headline">Welcome to Vidyarthi Vista!</CardTitle>
                         <CardDescription className="text-slate-300 text-lg">Your journey to success begins now.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        {emptyImage && <Image src={emptyImage.imageUrl} alt={emptyImage.description} data-ai-hint={emptyImage.imageHint} width={300} height={200} className="mx-auto rounded-lg" />}
                         <p className="text-slate-400">You haven't taken any tests yet. Create your first personalized mock test to kickstart your preparation.</p>
                         <Button size="lg" asChild className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105">
                             <Link href="/test/new">
                                 Start Your First Test <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                         </Button>
                     </CardContent>
                 </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0c132c] to-[#121a3a] text-white p-4 sm:p-6 md:p-8">
            <main className="max-w-7xl mx-auto space-y-8">
                <div className="animate-in fade-in duration-500">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back, {user?.displayName?.split(' ')[0] || 'User'}! 👋</h1>
                    <p className="text-slate-400">Ready to ace your exam?</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard icon={<BookOpen size={20} />} title="Tests Taken" value={stats.testsTaken.toString()} unit="Total mock tests completed" delay={100} />
                    <StatCard icon={<Target size={20} />} title="Avg. Score" value={`${stats.avgScore}%`} unit="Average score across all tests" delay={200} />
                    <StatCard icon={<Clock size={20} />} title="Study Time" value={`${stats.totalStudyTime}`} unit="Total hours spent on tests" delay={300} />
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4 animate-in fade-in duration-500" style={{ animationDelay: '400ms'}}>Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/test/new" className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: '500ms'}}>
                           <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 border-0 text-white h-full flex flex-col justify-center items-center text-center p-8 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30">
                                <PlayCircle size={48} className="mb-4" />
                                <h3 className="text-xl font-bold">Start New Test</h3>
                                <p className="text-sm text-cyan-100">Begin practice</p>
                           </Card>
                        </Link>
                         <Link href="/history" className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: '600ms'}}>
                           <Card className="bg-white/5 border-white/10 backdrop-blur-lg h-full flex flex-col justify-center items-center text-center p-8 rounded-2xl shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
                                <BarChart2 size={48} className="mb-4 text-accent" />
                                <h3 className="text-xl font-bold">Analytics</h3>
                                <p className="text-sm text-slate-400">View insights</p>
                           </Card>
                        </Link>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4 animate-in fade-in duration-500" style={{ animationDelay: '700ms'}}>
                            <h2 className="text-2xl font-bold">Recent Tests</h2>
                             <Button variant="ghost" asChild className="text-slate-300 hover:bg-white/10 hover:text-white">
                                <Link href="/history">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                             </Button>
                        </div>
                        <div className="space-y-4">
                            {recentTests.map((test, i) => (
                                <Link href={`/results/${test.id}`} key={test.id}>
                                    <Card 
                                        className="bg-white/5 border-white/10 backdrop-blur-lg p-4 flex items-center justify-between transition-all duration-300 hover:border-primary/50 hover:bg-white/10 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-8"
                                        style={{ animationDelay: `${800 + i * 100}ms`}}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/20 text-primary rounded-lg"><BookOpen /></div>
                                            <div>
                                                <p className="font-bold">{test.config.exam}</p>
                                                <p className="text-sm text-slate-400">{test.config.subjects?.join(', ') || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-400">{test.accuracy.toFixed(0)}%</p>
                                            <p className="text-xs text-slate-500">{format(new Date(test.takenAt), 'MMM d, yyyy')}</p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: '900ms'}}>
                        <h2 className="text-2xl font-bold mb-4">Weekly Progress</h2>
                        <Card className="bg-white/5 border-white/10 backdrop-blur-lg p-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyProgress} margin={{ top: 5, right: 5, left: -20, bottom: -10 }}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Bar dataKey="tests" radius={[4, 4, 0, 0]} >
                                        {weeklyProgress.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.tests > 0 ? '#2dd4bf' : 'rgba(148, 163, 184, 0.2)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
