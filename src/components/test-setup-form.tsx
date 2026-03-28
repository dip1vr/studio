
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import React, { useState, useTransition, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { DIFFICULTIES, EXAMS, LANGUAGES, SUBJECTS, TOPICS } from "@/lib/constants";
import { generateMockExamQuestions } from "@/ai/flows/generate-mock-exam-questions";
import { Loader2, Minus, Plus, ArrowRight, Hash, Clock, TrendingUp, BookOpen, FileText, Languages, Target, Info } from "lucide-react";
import type { TestSession, UserConfiguration } from "@/lib/types";
import { useDoc, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  exam: z.string({ required_error: "Please select an exam." }),
  subjects: z.array(z.string()).optional(),
  topic: z.string().optional(),
  numberOfQuestions: z.number().min(5).max(100),
  difficulty: z.enum(DIFFICULTIES),
  language: z.enum(LANGUAGES),
  suggestion: z.string().optional(),
  timeLimit: z.coerce.number().int().min(10).max(120).optional(),
  negativeMarking: z.boolean().default(false),
  negativeMarkingRatio: z.coerce.number().optional(),
}).refine(data => !data.negativeMarking || (data.negativeMarking && data.negativeMarkingRatio !== undefined), {
  message: "Please specify the negative marking ratio.",
  path: ["negativeMarkingRatio"],
});

const difficultyMapping = ['Easy', 'Medium', 'Hard', 'Mixed'] as const;

const GlassCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string, delay?: number }) => (
    <div
      className={cn(
        'bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 ease-out',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
        {children}
    </div>
);

export function TestSetupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const userConfigRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'userConfigurations', user.uid);
  }, [user, firestore]);

  const { data: userConfig } = useDoc<UserConfiguration>(userConfigRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjects: [],
      topic: undefined,
      numberOfQuestions: 10,
      difficulty: "Medium",
      language: "English",
      negativeMarking: false,
      timeLimit: 60,
    },
  });

  const watchAllFields = form.watch();
  
  useEffect(() => {
    if (watchAllFields.exam) {
      const availableSubjects = SUBJECTS[watchAllFields.exam] || [];
      setSubjects(availableSubjects);
      const currentSubjects = form.getValues('subjects') || [];
      const validSubjects = currentSubjects.filter(s => availableSubjects.includes(s));

      if (validSubjects.length !== currentSubjects.length) {
          form.setValue("subjects", validSubjects);
      }
    } else {
      setSubjects([]);
      form.setValue("subjects", []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchAllFields.exam]);

  useEffect(() => {
    if (watchAllFields.exam && watchAllFields.subjects && watchAllFields.subjects.length === 1) {
        const availableTopics = TOPICS[watchAllFields.exam]?.[watchAllFields.subjects[0]] || [];
        setTopics(availableTopics);
        const currentTopic = form.getValues('topic');
        if (currentTopic && !availableTopics.includes(currentTopic)) {
            form.setValue('topic', undefined);
        }
    } else {
        setTopics([]);
        form.setValue('topic', undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchAllFields.exam, watchAllFields.subjects]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      if (!userConfig?.apiKey) {
        toast({
          title: "API Key Missing",
          description: "Please set your Gemini API key in the Settings page before generating a test.",
          variant: "destructive",
        });
        router.push('/settings');
        return;
      }

      try {
        const questions = await generateMockExamQuestions({
          exam: values.exam,
          subjects: values.subjects && values.subjects.length > 0 ? values.subjects : undefined,
          topic: values.topic,
          numberOfQuestions: values.numberOfQuestions,
          difficulty: values.difficulty,
          language: values.language,
          suggestion: values.suggestion,
          apiKey: userConfig.apiKey,
        });

        if (!questions || questions.length === 0) {
          toast({
            title: "Error Generating Test",
            description: "The AI could not generate questions for the selected criteria. Please try a broader topic or different settings.",
            variant: "destructive",
          });
          return;
        }

        const testId = Date.now().toString();
        const testSession: TestSession = {
          id: testId,
          config: values,
          questions,
          userAnswers: questions.map(() => ({
            status: 'not-visited',
            selectedOption: null,
          })),
          startTime: Date.now(),
        };

        localStorage.setItem(`test_session_${testId}`, JSON.stringify(testSession));
        
        toast({
          title: "Test Ready!",
          description: "Your mock test has been generated successfully.",
        });

        router.push(`/test/${testId}`);
      } catch (error) {
        console.error("Failed to generate test:", error);
        toast({
          title: "An Unexpected Error Occurred",
          description: "Could not start the test. Please check your API key in settings and try again.",
          variant: "destructive",
        });
      }
    });
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <GlassCard delay={100}>
            <div className="grid md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="exam"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base"><BookOpen className="w-5 h-5 text-primary"/> Exam</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className="bg-background/70 transition-all duration-200 hover:border-primary/40"><SelectValue placeholder="Select an exam" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>{EXAMS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subjects"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-base"><FileText className="w-5 h-5 text-primary"/> Subjects</FormLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-auto min-h-10 py-2 bg-background/70 transition-all duration-200 hover:border-primary/40",
                                        !field.value?.length && "text-muted-foreground"
                                    )}
                                    disabled={subjects.length === 0}
                                    >
                                    {field.value?.length > 0 ? (
                                        <div className="flex gap-1.5 flex-wrap">
                                            {field.value.map(val => (
                                                <div key={val} className="truncate rounded-md bg-secondary text-secondary-foreground px-2 py-0.5 text-xs">
                                                    {val}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        "Select subjects (optional)"
                                    )}
                                    </Button>
                                </FormControl>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                                    <DropdownMenuLabel>Available Subjects</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <ScrollArea className="h-48">
                                        {subjects.map(subject => (
                                            <DropdownMenuCheckboxItem
                                            key={subject}
                                            checked={field.value?.includes(subject)}
                                            onCheckedChange={(checked) => {
                                                const selected = field.value || [];
                                                return checked
                                                ? field.onChange([...selected, subject])
                                                : field.onChange(selected.filter(s => s !== subject));
                                            }}
                                            >
                                            {subject}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base"><Target className="w-5 h-5 text-primary"/> Topic</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={topics.length === 0}
                        >
                            <FormControl>
                            <SelectTrigger className="bg-background/70 transition-all duration-200 hover:border-primary/40">
                                <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {topics.map((t) => (
                                <SelectItem key={t} value={t}>
                                {t}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                            Select a single subject to enable topics.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base"><Languages className="w-5 h-5 text-primary"/> Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className="bg-background/70 transition-all duration-200 hover:border-primary/40"><SelectValue placeholder="Select language" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </GlassCard>

        <GlassCard delay={200}>
            <div className="space-y-8">
                <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center mb-2">
                                <FormLabel className="flex items-center gap-2 text-lg"><Clock className="w-6 h-6 text-primary"/>Time Duration</FormLabel>
                                <span className="text-xl font-bold text-primary">{field.value}m</span>
                            </div>
                            <FormControl>
                                <Slider
                                    min={10} max={120} step={5}
                                    defaultValue={[field.value || 60]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>10m</span>
                                <span>120m</span>
                            </div>
                        </FormItem>
                    )}
                />
                <Separator className="bg-white/10" />
                 <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center mb-2">
                                <FormLabel className="flex items-center gap-2 text-lg"><TrendingUp className="w-6 h-6 text-primary"/>Difficulty Level</FormLabel>
                                <span className="inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-200 rounded-full dark:bg-red-900 dark:text-red-300">{field.value}</span>
                            </div>
                            <FormControl>
                                <Slider
                                    min={0} max={difficultyMapping.length - 1} step={1}
                                    defaultValue={[difficultyMapping.indexOf(field.value)]}
                                    onValueChange={(vals) => field.onChange(difficultyMapping[vals[0]])}
                                />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                {difficultyMapping.map(d => <span key={d}>{d}</span>)}
                            </div>
                        </FormItem>
                    )}
                />
            </div>
        </GlassCard>
        
        <GlassCard delay={300}>
             <FormField
                control={form.control}
                name="numberOfQuestions"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-2 text-lg mb-4"><Hash className="w-6 h-6 text-primary"/>Number of Questions</FormLabel>
                        <div className="flex items-center justify-center gap-4">
                            <Button type="button" variant="outline" size="icon" className="h-12 w-12 rounded-full transition-transform hover:scale-110 active:scale-100" onClick={() => form.setValue('numberOfQuestions', Math.max(5, field.value - 5))}><Minus /></Button>
                            <div className="text-5xl font-bold text-primary w-24 text-center transition-all duration-300">{field.value}</div>
                            <Button type="button" variant="outline" size="icon" className="h-12 w-12 rounded-full transition-transform hover:scale-110 active:scale-100" onClick={() => form.setValue('numberOfQuestions', Math.min(100, field.value + 5))}><Plus /></Button>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-4">
                            <span>Min: 5</span>
                            <span>Max: 100</span>
                        </div>
                    </FormItem>
                )}
            />
        </GlassCard>

        <GlassCard delay={400}>
             <FormField
                control={form.control}
                name="suggestion"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg"><Info className="w-6 h-6 text-primary"/>Specific Instructions (Optional)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="e.g., 'Focus on questions from the Mughal period' or 'Generate questions involving trigonometry identities'."
                        {...field}
                        className="bg-background/70"
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </GlassCard>

        <GlassCard delay={500}>
            <div className="grid md:grid-cols-2 gap-6 items-center">
                <FormField
                control={form.control}
                name="negativeMarking"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-background/20 transition-colors duration-200 hover:bg-background/30">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Negative Marking</FormLabel>
                            <FormDescription className="text-xs">Deduct marks for incorrect answers.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )}
                />
                {watchAllFields.negativeMarking && (
                    <div className="animate-in fade-in duration-500">
                        <FormField
                        control={form.control}
                        name="negativeMarkingRatio"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm">Ratio</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g., 0.25" {...field} value={field.value ?? ''} className="bg-background/70 transition-colors duration-200" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                )}
            </div>
        </GlassCard>

        <GlassCard delay={600} className="!bg-primary/90 text-primary-foreground">
            <h3 className="text-lg font-bold text-center mb-4">Test Summary</h3>
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-3xl font-bold">{watchAllFields.numberOfQuestions}</p>
                    <p className="text-sm opacity-80">Questions</p>
                </div>
                 <div>
                    <p className="text-3xl font-bold">{watchAllFields.timeLimit || "N/A"}{watchAllFields.timeLimit && 'm'}</p>
                    <p className="text-sm opacity-80">Duration</p>
                </div>
                 <div>
                    <p className="text-3xl font-bold">{watchAllFields.difficulty}</p>
                    <p className="text-sm opacity-80">Level</p>
                </div>
            </div>
        </GlassCard>
        
        <div className="pt-2 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 ease-out" style={{ animationDelay: '700ms' }}>
            <Button type="submit" size="lg" disabled={isPending} className="w-full text-lg h-14 rounded-full shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105">
                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isPending ? 'Generating Test...' : 'Start Mock Test'}
                {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
        </div>
      </form>
    </Form>
  );
}
