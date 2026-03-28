
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
import { Loader2 } from "lucide-react";
import type { TestSession, UserConfiguration } from "@/lib/types";
import { useDoc, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  exam: z.string({ required_error: "Please select an exam." }),
  subjects: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  numberOfQuestions: z.number().min(5).max(100),
  difficulty: z.enum(DIFFICULTIES),
  language: z.enum(LANGUAGES),
  suggestion: z.string().optional(),
  timeLimit: z.coerce.number().int().positive().optional(),
  negativeMarking: z.boolean().default(false),
  negativeMarkingRatio: z.coerce.number().optional(),
}).refine(data => !data.negativeMarking || (data.negativeMarking && data.negativeMarkingRatio !== undefined), {
  message: "Please specify the negative marking ratio.",
  path: ["negativeMarkingRatio"],
});

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
      topics: [],
      numberOfQuestions: 10,
      difficulty: "Medium",
      language: "English",
      negativeMarking: false,
    },
  });

  const examValue = form.watch("exam");
  const subjectsValue = form.watch("subjects");
  const negativeMarkingValue = form.watch("negativeMarking");
  
  useEffect(() => {
    if (examValue) {
      const availableSubjects = SUBJECTS[examValue] || [];
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
  }, [examValue]);

  useEffect(() => {
    if (examValue && subjectsValue && subjectsValue.length === 1) {
        const availableTopics = TOPICS[examValue]?.[subjectsValue[0]] || [];
        setTopics(availableTopics);
        const currentTopics = form.getValues('topics') || [];
        const validTopics = currentTopics.filter(t => availableTopics.includes(t));
        if(validTopics.length !== currentTopics.length) {
            form.setValue('topics', validTopics);
        }
    } else {
        setTopics([]);
        form.setValue('topics', []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examValue, subjectsValue]);


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
          topics: values.topics && values.topics.length > 0 ? values.topics : undefined,
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
        <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="exam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
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
                  <FormLabel>Subjects</FormLabel>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-auto min-h-10 py-2",
                            !field.value?.length && "text-muted-foreground"
                          )}
                          disabled={subjects.length === 0}
                        >
                          {field.value?.length > 0 ? (
                             <div className="flex gap-2 flex-wrap">
                                {field.value.map(val => (
                                    <div key={val} className="truncate rounded-md bg-secondary text-secondary-foreground px-2 py-1 text-xs">
                                        {val}
                                    </div>
                                ))}
                             </div>
                          ) : (
                            "Select subjects"
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
              name="topics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topics</FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <FormControl>
                        <Button
                           variant="outline"
                           className={cn(
                            "w-full justify-start text-left font-normal h-auto min-h-10 py-2",
                            !field.value?.length && "text-muted-foreground"
                          )}
                          disabled={topics.length === 0}
                        >
                          {field.value?.length > 0 ? (
                             <div className="flex gap-2 flex-wrap">
                                {field.value.map(val => (
                                    <div key={val} className="truncate rounded-md bg-secondary text-secondary-foreground px-2 py-1 text-xs">
                                        {val}
                                    </div>
                                ))}
                             </div>
                          ) : (
                            "Select topics"
                          )}
                        </Button>
                      </FormControl>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                        <DropdownMenuLabel>Available Topics</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                         <ScrollArea className="h-48">
                            {topics.map(topic => (
                                <DropdownMenuCheckboxItem
                                key={topic}
                                checked={field.value?.includes(topic)}
                                onCheckedChange={(checked) => {
                                    const selected = field.value || [];
                                    return checked
                                    ? field.onChange([...selected, topic])
                                    : field.onChange(selected.filter(s => s !== topic));
                                }}
                                >
                                {topic}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </ScrollArea>
                    </DropdownMenuContent>
                  </DropdownMenu>
                   <FormDescription>
                    Topics are only available when one subject is selected.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
            control={form.control}
            name="numberOfQuestions"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Number of Questions: {field.value}</FormLabel>
                    <FormControl>
                        <Slider
                            min={5} max={100} step={5}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="suggestion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specific Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'Focus on questions from the Mughal period' or 'Generate questions involving trigonometry identities'."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide specific instructions to the AI for question generation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (minutes, optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 60" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
         <div className="grid md:grid-cols-2 gap-8 items-start">
             <FormField
              control={form.control}
              name="negativeMarking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel>Negative Marking</FormLabel>
                        <FormDescription>Deduct marks for incorrect answers.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            {negativeMarkingValue && (
                 <FormField
                  control={form.control}
                  name="negativeMarkingRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative Marking Ratio</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.25 for 1/4th" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
        </div>
        <Button type="submit" size="lg" disabled={isPending} className="w-full md:w-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Generating Test...' : 'Start Test'}
        </Button>
      </form>
    </Form>
  );
}
