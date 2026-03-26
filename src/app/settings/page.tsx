
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
import type { AIProvider } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Schema only manages the provider selection now.
const settingsSchema = z.object({
  activeProvider: z.enum(["gemini", "claude", "openai", "deepseek"]),
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
    },
  });

  useEffect(() => {
    // Only loading the provider setting.
    const savedSettings = localStorage.getItem("ai_settings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      form.reset({ activeProvider: parsedSettings.activeProvider });
    }
    setIsMounted(true);
  }, [form]);
  
  if (!isMounted) {
    return <div className="container mx-auto max-w-2xl py-12">Loading settings...</div>;
  }

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    // Only saving the provider setting.
    localStorage.setItem("ai_settings", JSON.stringify(values));
    toast({
      title: "Settings Saved",
      description: "Your AI provider preference has been updated.",
    });
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Provider Settings</CardTitle>
          <CardDescription>
            Select your preferred AI provider for generating tests.
            <br />
            <span className="text-destructive font-medium">Note: Only Google Gemini is currently supported for backend operations. Other providers are for future use.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="activeProvider"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Active AI Provider</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit">Save Preference</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Server API Key Configuration</AlertTitle>
        <AlertDescription>
          For AI features to work, you must provide an API key for the server. 
          Create a file named <strong>.env</strong> in the project's root directory and add your Google Gemini API key:
          <pre className="mt-2 rounded-md bg-muted p-2 text-sm">
            GEMINI_API_KEY=YOUR_API_KEY_HERE
          </pre>
        </AlertDescription>
      </Alert>
    </div>
  );
}
