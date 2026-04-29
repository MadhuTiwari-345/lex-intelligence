import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
  Search, 
  Plus, 
  Sparkles,
  BookOpen
} from "lucide-react";

import { 
  useListResearchQueries, 
  useCreateResearchQuery, 
  getListResearchQueriesQueryKey,
  getGetDashboardSummaryQueryKey,
  useListMatters
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";

const createFormSchema = z.object({
  question: z.string().min(10, "Please provide a more detailed legal question"),
  jurisdiction: z.enum(["india", "uk", "us"]),
  matterId: z.coerce.number().optional().nullable(),
});

export default function Research() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('new') === 'true' && !isCreateOpen) {
    setIsCreateOpen(true);
    window.history.replaceState({}, '', '/research');
  }

  const { data: queries, isLoading } = useListResearchQueries();
  const { data: matters } = useListMatters();

  const createQuery = useCreateResearchQuery({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListResearchQueriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Research complete" });
        setIsCreateOpen(false);
        setLocation(`/research/${data.id}`);
      },
      onError: () => toast({ title: "Research failed", description: "Failed to generate research. Please try again.", variant: "destructive" })
    }
  });

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { question: "", jurisdiction: "us", matterId: null },
  });

  const filteredQueries = queries?.filter(q => 
    q.question.toLowerCase().includes(search.toLowerCase()) || 
    q.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Case Law Research</h1>
          <p className="text-muted-foreground mt-1 text-sm">Ask legal questions and get AI-synthesized precedents.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 shadow-sm">
          <Sparkles size={16} /> New Query
        </Button>
      </div>

      <div className="flex items-center bg-card p-2 rounded-lg border shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search past research queries..." 
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : !filteredQueries?.length ? (
           <div className="py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No research history</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Start your first AI-powered legal research query.</p>
            <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="gap-2">
              <Sparkles size={16} /> New Query
            </Button>
          </div>
        ) : (
          filteredQueries.map(query => (
            <Card key={query.id} className="hover-elevate cursor-pointer transition-all border-border/50 shadow-sm" onClick={() => setLocation(`/research/${query.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0 mt-1">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-medium text-base text-foreground leading-tight">{query.question}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{query.summary}</p>
                    
                    <div className="flex items-center gap-3 pt-2">
                      <Badge variant="outline" className="text-[10px] uppercase">{query.jurisdiction}</Badge>
                      <span className="text-xs text-muted-foreground font-medium">{query.citations?.length || 0} Citations</span>
                      <span className="text-xs text-muted-foreground">• {format(parseISO(query.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2"><Sparkles className="text-primary" /> AI Legal Research</DialogTitle>
            <DialogDescription>
              Ask a specific legal question. The AI will synthesize an answer citing relevant case law and statutes.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => createQuery.mutate({ data: v }))} className="space-y-4">
              <FormField control={form.control} name="question" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g. Under California law, what are the required elements to pierce the corporate veil in a breach of contract claim?" 
                      className="h-32 resize-none text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="jurisdiction" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="matterId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Matter <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))} value={field.value ? field.value.toString() : "none"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a matter" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">No matter</SelectItem>
                        {matters?.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createQuery.isPending} className="bg-primary hover:bg-primary/90">
                  {createQuery.isPending ? <><Sparkles size={16} className="mr-2 animate-pulse" /> Researching...</> : "Run Research"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
