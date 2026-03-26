
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { AIProvider } from "@/lib/types";

const settingsSchema = z.object({
  activeProvider: z.enum(["gemini", "claude", "openai", "deepseek"]),
  geminiApiKey: z.string().optional(),
  claudeApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  deepseekApiKey: z.string().optional(),
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
    const savedSettings = localStorage.getItem("ai_settings");
    if (savedSettings) {
      form.reset(JSON.parse(savedSettings));
    }
    setIsMounted(true);
  }, [form]);
  
  if (!isMounted) {
    return <div className="container mx-auto max-w-2xl py-12">Loading settings...</div>;
  }

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    localStorage.setItem("ai_settings", JSON.stringify(values));
    toast({
      title: "Settings Saved",
      description: "Your AI provider settings have been updated.",
    });
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Provider Settings</CardTitle>
          <CardDescription>
            Configure your preferred AI provider for generating tests. Keys are stored locally in your browser.
            <br />
            <span className="text-destructive font-medium">Note: Only Google Gemini is currently supported for backend operations.</span>
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
              
              <div className="space-y-4">
                 {PROVIDERS.map(provider => (
                  <FormField
                    key={provider.id}
                    control={form.control}
                    name={`${provider.id}ApiKey` as keyof z.infer<typeof settingsSchema>}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{provider.name} API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={`Enter your ${provider.name} API Key`} {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 ))}
              </div>

              <Button type="submit">Save Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
