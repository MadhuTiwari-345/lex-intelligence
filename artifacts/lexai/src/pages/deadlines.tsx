import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isPast } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2
} from "lucide-react";

import { 
  useListDeadlines, 
  useCreateDeadline, 
  useUpdateDeadline,
  useDeleteDeadline,
  getListDeadlinesQueryKey,
  getGetDashboardSummaryQueryKey,
  getListUpcomingDeadlinesQueryKey,
  useListMatters
} from "@workspace/api-client-react";
import { DeadlineStatus } from "@workspace/api-client-react/src/generated/api.schemas";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const createFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  type: z.enum(["filing", "court_date", "statute", "internal", "client_meeting"]),
  priority: z.enum(["low", "medium", "high"]),
  matterId: z.coerce.number().optional().nullable(),
});

export default function Deadlines() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("upcoming");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('new') === 'true' && !isCreateOpen) {
    setIsCreateOpen(true);
    window.history.replaceState({}, '', '/deadlines');
  }

  const { data: deadlines, isLoading } = useListDeadlines(
    statusFilter !== "all" ? { status: statusFilter as DeadlineStatus } : {}
  );
  
  const { data: matters } = useListMatters();

  const createDeadline = useCreateDeadline({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDeadlinesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListUpcomingDeadlinesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Deadline created successfully" });
        setIsCreateOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Failed to create deadline", variant: "destructive" })
    }
  });

  const updateDeadline = useUpdateDeadline({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDeadlinesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListUpcomingDeadlinesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Deadline updated" });
      }
    }
  });

  const deleteDeadline = useDeleteDeadline({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDeadlinesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListUpcomingDeadlinesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Deadline deleted" });
      }
    }
  });

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { 
      title: "", 
      description: "", 
      dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"), 
      type: "internal", 
      priority: "medium", 
      matterId: null 
    },
  });

  const filteredDeadlines = deadlines?.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    (d.matterName && d.matterName.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Deadlines</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track filings, court dates, and internal milestones.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> New Deadline
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-2 rounded-lg border shadow-sm">
        <Tabs defaultValue="upcoming" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-muted">All</TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-muted text-primary">Upcoming</TabsTrigger>
            <TabsTrigger value="missed" className="data-[state=active]:bg-muted text-destructive">Overdue</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-muted text-green-600">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search deadlines..." 
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : !filteredDeadlines?.length ? (
           <div className="py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No deadlines found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">You're all caught up.</p>
            <Button onClick={() => setIsCreateOpen(true)} variant="outline">Add Deadline</Button>
          </div>
        ) : (
          filteredDeadlines.map(deadline => {
            const date = parseISO(deadline.dueDate);
            const isOverdue = deadline.status !== 'completed' && isPast(date);
            
            return (
              <Card key={deadline.id} className={`transition-all border-l-4 ${
                deadline.status === 'completed' ? 'border-l-green-500 opacity-75' :
                isOverdue ? 'border-l-destructive bg-destructive/5' :
                deadline.priority === 'high' ? 'border-l-orange-500' : 'border-l-primary'
              }`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-md bg-muted flex flex-col items-center justify-center shrink-0 border">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none">{format(date, "MMM")}</span>
                      <span className="text-lg font-bold leading-tight">{format(date, "d")}</span>
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-base truncate ${deadline.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {deadline.title}
                        </h3>
                        {isOverdue && <Badge variant="destructive" className="text-[10px] uppercase">Overdue</Badge>}
                        {deadline.status === 'completed' && <Badge variant="outline" className="text-[10px] text-green-600 border-green-600 uppercase bg-green-50">Done</Badge>}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {format(date, "h:mm a")}
                        </span>
                        <span className="capitalize">• {deadline.type.replace('_', ' ')}</span>
                        {deadline.matterName && (
                          <span className="truncate max-w-[200px]">• Matter: {deadline.matterName}</span>
                        )}
                        {deadline.priority === 'high' && deadline.status !== 'completed' && (
                          <span className="text-orange-500 font-medium flex items-center gap-1">
                            • <AlertTriangle size={12} /> High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {deadline.status !== 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        onClick={() => updateDeadline.mutate({ id: deadline.id, data: { status: 'completed' } })}
                        disabled={updateDeadline.isPending}
                      >
                        <CheckCircle2 size={16} className="mr-2" /> Complete
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {deadline.status === 'completed' && (
                          <DropdownMenuItem onClick={() => updateDeadline.mutate({ id: deadline.id, data: { status: isPast(date) ? 'missed' : 'upcoming' } })}>
                            Mark as Incomplete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteDeadline.mutate({ id: deadline.id })}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">New Deadline</DialogTitle>
            <DialogDescription>Track an important date or filing requirement.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => createDeadline.mutate({ data: v }))} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g. File Motion to Dismiss" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem><FormLabel>Due Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="priority" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="filing">Filing</SelectItem>
                        <SelectItem value="court_date">Court Date</SelectItem>
                        <SelectItem value="statute">Statute of Limitations</SelectItem>
                        <SelectItem value="client_meeting">Client Meeting</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
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
                        <SelectItem value="none">No matter (General)</SelectItem>
                        {matters?.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                  <FormControl><Input placeholder="Additional details..." {...field} /></FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createDeadline.isPending}>{createDeadline.isPending ? "Saving..." : "Save Deadline"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
