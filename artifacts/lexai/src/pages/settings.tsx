import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Building2, User, Globe, Zap } from "lucide-react";

import { 
  useGetSettings, 
  useUpdateSettings,
  getGetSettingsQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  firmName: z.string().optional(),
  attorneyName: z.string().optional(),
  defaultJurisdiction: z.enum(["india", "uk", "us"]),
  plan: z.enum(["solo", "firm", "enterprise"]),
});

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useGetSettings();

  const updateSettings = useUpdateSettings({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetSettingsQueryKey(), data);
        toast({ title: "Settings saved", description: "Your preferences have been updated." });
      },
      onError: () => toast({ title: "Save failed", variant: "destructive" })
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      firmName: "", 
      attorneyName: "", 
      defaultJurisdiction: "us", 
      plan: "solo" 
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        firmName: settings.firmName || "",
        attorneyName: settings.attorneyName || "",
        defaultJurisdiction: settings.defaultJurisdiction,
        plan: settings.plan,
      });
    }
  }, [settings, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateSettings.mutate({ data: values });
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your firm identity and AI defaults.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <User size={18} className="text-primary" /> Profile & Identity
              </CardTitle>
              <CardDescription>How you appear on generated documents and reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="attorneyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attorney Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe, Esq." {...field} className="bg-muted/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firm Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-3 top-3 text-muted-foreground" />
                          <Input placeholder="Doe & Partners" className="pl-10 bg-muted/30" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Globe size={18} className="text-primary" /> Default Jurisdiction
              </CardTitle>
              <CardDescription>
                This acts as the baseline for all AI contract drafting, analysis, and case law research.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="defaultJurisdiction"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="us" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                            <span className="text-2xl mb-2 font-serif">US</span>
                            <span className="text-sm font-medium">United States</span>
                          </FormLabel>
                        </FormItem>
                        
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="uk" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                            <span className="text-2xl mb-2 font-serif">UK</span>
                            <span className="text-sm font-medium">United Kingdom</span>
                          </FormLabel>
                        </FormItem>

                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="india" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                            <span className="text-2xl mb-2 font-serif">IN</span>
                            <span className="text-sm font-medium">India</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Zap size={18} className="text-primary" /> Plan & Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/30 border rounded-lg">
                <div>
                  <p className="font-semibold text-foreground capitalize">{settings?.plan} Plan</p>
                  <p className="text-sm text-muted-foreground mt-1">Unlimited matters, contracts, and AI generation.</p>
                </div>
                <Button variant="outline" type="button" disabled>Upgrade Plan</Button>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t justify-end py-4">
              <Button type="submit" disabled={updateSettings.isPending} className="w-full sm:w-auto px-8">
                {updateSettings.isPending ? "Saving..." : <><Save size={16} className="mr-2" /> Save Settings</>}
              </Button>
            </CardFooter>
          </Card>

        </form>
      </Form>
    </div>
  );
}
