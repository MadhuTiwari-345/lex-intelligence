import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Files,
  Calendar
} from "lucide-react";

import { 
  useListMatters, 
  useCreateMatter, 
  getListMattersQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { Jurisdiction, MatterStatus } from "@workspace/api-client-react/src/generated/api.schemas";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(1, "Matter name is required"),
  client: z.string().min(1, "Client name is required"),
  jurisdiction: z.enum(["india", "uk", "us"]),
  description: z.string().optional(),
  practiceArea: z.string().optional(),
});

export default function Matters() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Also check URL query for "new=true" to auto-open modal
  const urlParams = new URLSearchParams(window.location.search);
  const isNewInUrl = urlParams.get('new') === 'true';
  
  if (isNewInUrl && !isCreateOpen) {
    setIsCreateOpen(true);
    // Remove query param without refresh
    window.history.replaceState({}, '', '/matters');
  }

  const { data: matters, isLoading } = useListMatters(
    statusFilter !== "all" ? { status: statusFilter as MatterStatus } : {}
  );

  const createMatter = useCreateMatter({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListMattersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Matter created", description: `Successfully created ${data.name}.` });
        setIsCreateOpen(false);
        setLocation(`/matters/${data.id}`);
      },
      onError: (error: any) => {
        toast({ 
          title: "Error", 
          description: error?.data?.message || "Failed to create matter.",
          variant: "destructive"
        });
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client: "",
      jurisdiction: "us",
      description: "",
      practiceArea: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMatter.mutate({ data: values });
  }

  const filteredMatters = matters?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Matters</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your firm's cases and legal matters.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} /> New Matter
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-2 rounded-lg border shadow-sm">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-muted">All</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-muted text-primary">Active</TabsTrigger>
            <TabsTrigger value="on_hold" className="data-[state=active]:bg-muted text-yellow-600">On Hold</TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-muted text-muted-foreground">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or client..." 
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : !filteredMatters?.length ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-card/50">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No matters found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              {search ? "Try adjusting your search terms." : "Create your first matter to get started."}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                Create Matter
              </Button>
            )}
          </div>
        ) : (
          filteredMatters.map(matter => (
            <Card key={matter.id} className="hover-elevate cursor-pointer transition-all border-border/50 shadow-sm" onClick={() => setLocation(`/matters/${matter.id}`)}>
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1 w-[80%]">
                  <CardTitle className="text-lg font-serif truncate" title={matter.name}>{matter.name}</CardTitle>
                  <p className="text-sm text-muted-foreground font-medium truncate" title={matter.client}>{matter.client}</p>
                </div>
                <MatterStatusBadge status={matter.status} />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">
                  {matter.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between text-xs border-t pt-3 mt-auto">
                  <div className="flex gap-3 text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><FileText size={14} /> Docs</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> Dates</span>
                  </div>
                  <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{matter.jurisdiction}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">New Matter</DialogTitle>
            <DialogDescription>
              Create a new legal matter workspace to track contracts, documents, and deadlines.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matter Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corp Acquisition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jurisdiction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurisdiction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select jurisdiction" />
                          </SelectTrigger>
                        </FormControl>
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
                control={form.control}
                name="practiceArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Practice Area <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. M&A, Real Estate, Litigation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Brief summary of the matter..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMatter.isPending}>
                  {createMatter.isPending ? "Creating..." : "Create Matter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatterStatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return <Badge className="bg-primary text-primary-foreground hover:bg-primary gap-1"><CheckCircle2 size={12} /> Active</Badge>;
  }
  if (status === "on_hold") {
    return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:text-yellow-400 gap-1"><Clock size={12} /> On Hold</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground gap-1"><XCircle size={12} /> Closed</Badge>;
}
