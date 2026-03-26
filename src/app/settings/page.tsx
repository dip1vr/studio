
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { AIProvider, UserConfiguration } from "@/lib/types";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import { saveUserConfiguration } from "@/lib/user-actions";

const settingsSchema = z.object({
  activeProvider: z.enum(["gemini", "claude", "openai", "deepseek"]),
  apiKey: z.string().optional(),
});

const PROVIDERS: { id: AIProvider, name: string }[] = [
    { id: "gemini", name: "Google Gemini" },
    { id: "claude", name: "Anthropic Claude", disabled: true },
    { id: "openai", name: "OpenAI ChatGPT", disabled: true },
    { id: "deepseek", name: "DeepSeek", disabled: true },
];

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userConfigRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'userConfigurations', user.uid);
  }, [user, firestore]);

  const { data: userConfig, isLoading } = useDoc<UserConfiguration>(userConfigRef);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      activeProvider: 'gemini',
      apiKey: "",
    },
  });

  useEffect(() => {
    if (userConfig) {
      form.reset({
        activeProvider: userConfig.activeProvider || 'gemini',
        apiKey: userConfig.apiKey || "",
      });
    }
  }, [userConfig, form]);

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!firestore || !user) {
      toast({ title: "Error", description: "Could not save settings. User not found.", variant: "destructive" });
      return;
    }
    saveUserConfiguration(firestore, user.uid, values);
    toast({
      title: "Settings Saved",
      description: "Your AI preferences have been saved to your profile.",
    });
  }

  if (isLoading) {
    return <div className="container mx-auto max-w-2xl py-12">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Settings</CardTitle>
          <CardDescription>
            Manage your AI provider. Your settings are saved to your user profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemini API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your Google Gemini API key" {...field} />
                    </FormControl>
                    <FormDescription>
                     Your API key is stored in your user profile in the database and used for generating tests.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activeProvider"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Active AI Provider</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {PROVIDERS.map(provider => (
                          <FormItem key={provider.id}>
                            <FormControl>
                                <RadioGroupItem value={provider.id} id={provider.id} className="peer sr-only" disabled={provider.disabled} />
                            </FormControl>
                            <Label
                              htmlFor={provider.id}
                              className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${provider.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                              {provider.name}
                            </Label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                     <FormDescription>
                        Currently, only Google Gemini is fully supported.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit">Save Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
