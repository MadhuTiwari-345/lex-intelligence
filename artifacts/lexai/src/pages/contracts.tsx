import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
  FileText, 
  Search, 
  Plus, 
  Sparkles,
  AlertTriangle
} from "lucide-react";

import { 
  useListContracts, 
  useCreateContract, 
  useDraftContract,
  getListContractsQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { ContractStatus, ContractType, Jurisdiction } from "@workspace/api-client-react/src/generated/api.schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const createFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["nda", "msa", "employment", "lease", "spa", "services", "partnership", "licensing", "consulting", "other"]),
  jurisdiction: z.enum(["india", "uk", "us"]),
  status: z.enum(["draft", "review", "signed"]),
  counterparty: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

const draftFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["nda", "msa", "employment", "lease", "spa", "services", "partnership", "licensing", "consulting", "other"]),
  jurisdiction: z.enum(["india", "uk", "us"]),
  counterparty: z.string().optional(),
  prompt: z.string().min(10, "Please provide more details for the AI to draft the contract"),
});

export default function Contracts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('new') === 'true' && !isDraftOpen && !isCreateOpen) {
    setIsDraftOpen(true);
    window.history.replaceState({}, '', '/contracts');
  }

  const { data: contracts, isLoading } = useListContracts(
    statusFilter !== "all" ? { status: statusFilter as ContractStatus } : {}
  );

  const createContract = useCreateContract({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListContractsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Contract created" });
        setIsCreateOpen(false);
        setLocation(`/contracts/${data.id}`);
      },
      onError: (error: any) => toast({ title: "Error", description: error?.data?.message || "Failed to create contract.", variant: "destructive" })
    }
  });

  const draftContract = useDraftContract({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListContractsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Contract drafted successfully" });
        setIsDraftOpen(false);
        setLocation(`/contracts/${data.id}`);
      },
      onError: (error: any) => toast({ title: "Error", description: error?.data?.message || "Failed to draft contract.", variant: "destructive" })
    }
  });

  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { title: "", type: "nda", jurisdiction: "us", status: "draft", counterparty: "", content: "" },
  });

  const draftForm = useForm<z.infer<typeof draftFormSchema>>({
    resolver: zodResolver(draftFormSchema),
    defaultValues: { title: "", type: "nda", jurisdiction: "us", counterparty: "", prompt: "" },
  });

  const filteredContracts = contracts?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.counterparty && c.counterparty.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Contracts</h1>
          <p className="text-muted-foreground mt-1 text-sm">Draft, review, and manage your firm's contracts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus size={16} /> Manual Upload
          </Button>
          <Button onClick={() => setIsDraftOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
            <Sparkles size={16} /> Draft with AI
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-2 rounded-lg border shadow-sm">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-muted">All</TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-muted">Draft</TabsTrigger>
            <TabsTrigger value="review" className="data-[state=active]:bg-muted">Review</TabsTrigger>
            <TabsTrigger value="signed" className="data-[state=active]:bg-muted text-green-600">Signed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search titles or counterparties..." 
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : !filteredContracts?.length ? (
           <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-card/50">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No contracts found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Create or draft your first contract.</p>
          </div>
        ) : (
          filteredContracts.map(contract => (
            <Card key={contract.id} className="hover-elevate cursor-pointer transition-all border-border/50 shadow-sm" onClick={() => setLocation(`/contracts/${contract.id}`)}>
              <CardContent className="p-5 flex flex-col h-full justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="bg-primary/10 p-2 rounded text-primary">
                      <FileText size={18} />
                    </div>
                    <Badge variant={contract.status === 'signed' ? 'default' : contract.status === 'review' ? 'secondary' : 'outline'}>
                      {contract.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base line-clamp-1" title={contract.title}>{contract.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{contract.counterparty || "No counterparty"}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{contract.type}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{contract.jurisdiction}</Badge>
                  </div>
                  {contract.riskScore !== undefined && contract.riskScore !== null && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${contract.riskScore > 60 ? 'text-destructive' : contract.riskScore > 30 ? 'text-orange-500' : 'text-green-600'}`}>
                      {contract.riskScore > 60 && <AlertTriangle size={12} />}
                      {contract.riskScore}% Risk
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Draft Contract Modal */}
      <Dialog open={isDraftOpen} onOpenChange={setIsDraftOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2"><Sparkles className="text-primary" /> Draft with AI</DialogTitle>
            <DialogDescription>
              Describe the contract you need, and our AI will generate a complete first draft tailored to your jurisdiction.
            </DialogDescription>
          </DialogHeader>
          <Form {...draftForm}>
            <form onSubmit={draftForm.handleSubmit(v => draftContract.mutate({ data: v }))} className="space-y-4">
              <FormField
                control={draftForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Master Services Agreement - Acme" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={draftForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["nda", "msa", "employment", "lease", "spa", "services", "partnership", "licensing", "consulting", "other"].map(t => (
                            <SelectItem key={t} value={t} className="uppercase">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={draftForm.control}
                  name="jurisdiction"
                  render={({ field }) => (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={draftForm.control}
                name="counterparty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Counterparty <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Acme Corp" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={draftForm.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the terms, duration, payment schedule, and any specific clauses to include..." className="h-32 resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDraftOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={draftContract.isPending} className="bg-primary hover:bg-primary/90">
                  {draftContract.isPending ? <><Sparkles size={16} className="mr-2 animate-pulse" /> Drafting...</> : "Generate Draft"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manual Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Manual Upload</DialogTitle>
            <DialogDescription>Paste an existing contract to track and analyze it.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(v => createContract.mutate({ data: v }))} className="space-y-4">
              <FormField control={createForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={createForm.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["nda", "msa", "employment", "lease", "spa", "services", "partnership", "licensing", "consulting", "other"].map(t => (
                          <SelectItem key={t} value={t} className="uppercase">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="jurisdiction" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="us">US</SelectItem><SelectItem value="uk">UK</SelectItem><SelectItem value="india">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={createForm.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem><SelectItem value="review">Review</SelectItem><SelectItem value="signed">Signed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="counterparty" render={({ field }) => (
                  <FormItem><FormLabel>Counterparty</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={createForm.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Content</FormLabel>
                  <FormControl><Textarea className="h-48 font-mono text-xs" placeholder="Paste contract text here..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createContract.isPending}>{createContract.isPending ? "Saving..." : "Save Contract"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
