
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
import type { AIProvider } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, AlertTriangle } from "lucide-react";

// Schema for all settings, including the optional API key for client-side storage
const settingsSchema = z.object({
  activeProvider: z.enum(["gemini", "claude", "openai", "deepseek"]),
  apiKey: z.string().optional(),
});

const PROVIDERS: { id: AIProvider, name: string }[] = [
    { id: "gemini", name: "Google Gemini" },
    { id: "claude", name: "Anthropic Claude" },
    { id: "openai", name: "OpenAI ChatGPT" },
    { id: "deepseek", name: "DeepSeek" },
];

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      activeProvider: 'gemini',
      apiKey: "", // Default to empty string to ensure input is always controlled
    },
  });

  useEffect(() => {
    // Load all settings from localStorage
    const savedSettings = localStorage.getItem("ai_settings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      // Ensure apiKey is always a string to prevent uncontrolled to controlled switch
      form.reset({
        ...parsedSettings,
        apiKey: parsedSettings.apiKey || "", 
      });
    }
    setIsMounted(true);
  }, [form]);
  
  if (!isMounted) {
    return <div className="container mx-auto max-w-2xl py-12">Loading settings...</div>;
  }

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    // Save all settings to localStorage
    localStorage.setItem("ai_settings", JSON.stringify(values));
    toast({
      title: "Settings Saved",
      description: "Your AI preferences have been saved in your browser.",
    });
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 space-y-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Action Required: Configure Server API Key</AlertTitle>
        <AlertDescription>
          For AI test generation to work, the server needs your API key.
          Please create a file named <strong>.env</strong> in your project's root directory and add your key:
          <pre className="mt-2 rounded-md bg-primary/10 p-2 text-sm font-mono text-destructive-foreground">
            GEMINI_API_KEY=YOUR_API_KEY_HERE
          </pre>
           <p className="mt-2 text-xs">The API key field on this page saves the key only in your browser for potential future use and will **not** work for generating tests.</p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Settings</CardTitle>
          <CardDescription>
            Manage your AI provider and other preferences. Settings are saved in your browser.
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
                    <FormLabel>Gemini API Key (Browser Storage)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter API key for browser storage" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>
                     This key is stored only in your browser. It is NOT used for server-side test generation.
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
                                <RadioGroupItem value={provider.id} id={provider.id} className="peer sr-only" />
                            </FormControl>
                            <Label
                              htmlFor={provider.id}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              {provider.name}
                            </Label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                     <FormDescription>
                        Currently, only Google Gemini is supported for backend operations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit">Save Preferences</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
