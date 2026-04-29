import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
  MessageSquare, 
  Search, 
  Sparkles,
  ArrowRight
} from "lucide-react";

import { 
  useListBriefs, 
  useCreateBrief, 
  getListBriefsQueryKey,
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
  title: z.string().min(1, "Title is required"),
  complexity: z.enum(["basic", "standard", "detailed"]),
  matterId: z.coerce.number().optional().nullable(),
  originalText: z.string().min(20, "Please provide the legalese text to translate"),
});

export default function Briefs() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('new') === 'true' && !isCreateOpen) {
    setIsCreateOpen(true);
    window.history.replaceState({}, '', '/briefs');
  }

  const { data: briefs, isLoading } = useListBriefs();
  const { data: matters } = useListMatters();

  const createBrief = useCreateBrief({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListBriefsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Brief generated successfully" });
        setIsCreateOpen(false);
        setLocation(`/briefs/${data.id}`);
      },
      onError: () => toast({ title: "Generation failed", variant: "destructive" })
    }
  });

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { title: "", complexity: "standard", matterId: null, originalText: "" },
  });

  const filteredBriefs = briefs?.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Client Briefs</h1>
          <p className="text-muted-foreground mt-1 text-sm">Translate complex legalese into clear, client-ready explanations.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 shadow-sm">
          <Sparkles size={16} /> Generate Brief
        </Button>
      </div>

      <div className="flex items-center bg-card p-2 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search briefs by title..." 
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : !filteredBriefs?.length ? (
           <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No briefs found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Generate your first plain-English explanation for a client.</p>
            <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="gap-2">
              <Sparkles size={16} /> Generate Brief
            </Button>
          </div>
        ) : (
          filteredBriefs.map(brief => (
            <Card key={brief.id} className="hover-elevate cursor-pointer transition-all border-border/50 shadow-sm" onClick={() => setLocation(`/briefs/${brief.id}`)}>
              <CardContent className="p-5 flex flex-col h-full justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0 mt-1">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-medium text-base text-foreground truncate" title={brief.title}>{brief.title}</h3>
                    <p className="text-xs text-muted-foreground">Generated {format(parseISO(brief.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px] shrink-0">{brief.complexity}</Badge>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground group">
                  <span className="truncate max-w-[250px]">{brief.matterId ? `Matter #${brief.matterId}` : "Standalone"}</span>
                  <span className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2"><Sparkles className="text-primary" /> Generate Client Brief</DialogTitle>
            <DialogDescription>
              Paste dense legal text and get a clear, plain-English explanation ready to send to your client.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => createBrief.mutate({ data: v }))} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Brief Title</FormLabel><FormControl><Input placeholder="e.g. Explanation of Indemnity Clause" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="complexity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic (High level summary)</SelectItem>
                        <SelectItem value="standard">Standard (Balanced detail)</SelectItem>
                        <SelectItem value="detailed">Detailed (Thorough breakdown)</SelectItem>
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

              <FormField control={form.control} name="originalText" render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Legalese</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Paste the complex clause, ruling, or contract text here..." 
                      className="h-48 font-mono text-xs resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createBrief.isPending} className="bg-primary hover:bg-primary/90">
                  {createBrief.isPending ? <><Sparkles size={16} className="mr-2 animate-pulse" /> Translating...</> : "Generate Brief"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
