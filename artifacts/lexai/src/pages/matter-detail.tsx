import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
  Briefcase, 
  ArrowLeft,
  Calendar,
  FileText,
  Files,
  MoreVertical,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus
} from "lucide-react";

import { 
  useGetMatter, 
  useUpdateMatter,
  useDeleteMatter,
  useListContracts,
  useListDocuments,
  useListDeadlines,
  getGetMatterQueryKey,
  getListMattersQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { MatterStatus } from "@workspace/api-client-react/src/generated/api.schemas";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MatterDetail({ params }: { params: { id: string } }) {
  const matterId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: matter, isLoading: isLoadingMatter } = useGetMatter(matterId);
  const { data: contracts, isLoading: isLoadingContracts } = useListContracts({ matterId });
  const { data: documents, isLoading: isLoadingDocs } = useListDocuments({ matterId });
  const { data: deadlines, isLoading: isLoadingDeadlines } = useListDeadlines({ matterId });

  const updateMatter = useUpdateMatter({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMatterQueryKey(matterId) });
        queryClient.invalidateQueries({ queryKey: getListMattersQueryKey() });
        toast({ title: "Matter updated successfully." });
      },
      onError: () => toast({ title: "Failed to update matter", variant: "destructive" })
    }
  });

  const deleteMatter = useDeleteMatter({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMattersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Matter deleted successfully." });
        setLocation("/matters");
      },
      onError: () => toast({ title: "Failed to delete matter", variant: "destructive" })
    }
  });

  const handleStatusChange = (status: MatterStatus) => {
    updateMatter.mutate({ id: matterId, data: { status } });
  };

  const handleDelete = () => {
    deleteMatter.mutate({ id: matterId });
  };

  if (isLoadingMatter) {
    return <MatterDetailSkeleton />;
  }

  if (!matter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Matter Not Found</h2>
        <p className="text-muted-foreground mb-6">The matter you're looking for doesn't exist or has been deleted.</p>
        <Link href="/matters">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Matters</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/matters" className="hover:text-foreground transition-colors flex items-center">
              <ArrowLeft className="mr-1 h-3 w-3" /> Matters
            </Link>
            <span>/</span>
            <span>{matter.client}</span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
            {matter.name}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{matter.jurisdiction}</Badge>
            <Badge variant={matter.status === 'active' ? 'default' : matter.status === 'on_hold' ? 'secondary' : 'outline'}>
              {matter.status.replace('_', ' ')}
            </Badge>
            {matter.practiceArea && <span className="text-sm text-muted-foreground">• {matter.practiceArea}</span>}
            <span className="text-sm text-muted-foreground">• Created {format(parseISO(matter.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Update Status <MoreVertical size={14} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('active')} disabled={matter.status === 'active'}>
                Mark as Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('on_hold')} disabled={matter.status === 'on_hold'}>
                Put On Hold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('closed')} disabled={matter.status === 'closed'}>
                Close Matter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Matter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-muted-foreground">{matter.description || "No description provided."}</p>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Overview</TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Contracts ({matter.contractCount})</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Documents ({matter.documentCount})</TabsTrigger>
          <TabsTrigger value="deadlines" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Deadlines ({matter.deadlineCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-serif">Recent Contracts</CardTitle>
                  <Link href="/contracts?new=true">
                    <Button variant="ghost" size="sm" className="h-8"><Plus size={14} className="mr-1" /> New</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoadingContracts ? (
                    <Skeleton className="h-32 w-full" />
                  ) : contracts && contracts.length > 0 ? (
                    <div className="space-y-3">
                      {contracts.slice(0, 3).map(contract => (
                        <div key={contract.id} className="flex justify-between items-center p-3 rounded-md border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setLocation(`/contracts/${contract.id}`)}>
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-primary" />
                            <div>
                              <p className="font-medium text-sm">{contract.title}</p>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">{contract.type}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{contract.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No contracts yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-serif">Recent Documents</CardTitle>
                  <Link href="/documents?new=true">
                    <Button variant="ghost" size="sm" className="h-8"><Plus size={14} className="mr-1" /> Add</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoadingDocs ? (
                    <Skeleton className="h-32 w-full" />
                  ) : documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.slice(0, 3).map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 rounded-md border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setLocation(`/documents/${doc.id}`)}>
                          <div className="flex items-center gap-3">
                            <Files size={16} className="text-primary" />
                            <div>
                              <p className="font-medium text-sm">{doc.title}</p>
                              {doc.riskScore !== undefined && doc.riskScore !== null && (
                                <p className="text-xs text-muted-foreground">Risk: {doc.riskScore}%</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No documents yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDeadlines ? (
                    <Skeleton className="h-32 w-full" />
                  ) : deadlines && deadlines.length > 0 ? (
                    <div className="space-y-3">
                      {deadlines.filter(d => d.status === 'upcoming').slice(0, 5).map(deadline => {
                        const isOverdue = new Date(deadline.dueDate) < new Date();
                        return (
                          <div key={deadline.id} className="flex gap-3">
                            <div className="w-10 h-10 rounded bg-muted flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none">{format(parseISO(deadline.dueDate), "MMM")}</span>
                              <span className="text-sm font-bold leading-tight">{format(parseISO(deadline.dueDate), "d")}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" title={deadline.title}>{deadline.title}</p>
                              <p className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                {isOverdue ? 'Overdue' : deadline.type.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="pt-6">
          {isLoadingContracts ? (
            <Skeleton className="h-64 w-full" />
          ) : contracts && contracts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {contracts.map(contract => (
                <Card key={contract.id} className="hover-elevate cursor-pointer transition-all" onClick={() => setLocation(`/contracts/${contract.id}`)}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded text-primary mt-1">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{contract.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase">{contract.type}</Badge>
                        <span className="text-xs text-muted-foreground">{contract.status}</span>
                      </div>
                      {contract.riskScore !== undefined && contract.riskScore !== null && (
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                          {contract.riskScore > 60 ? <AlertTriangle size={12} className="text-destructive" /> : null}
                          <span className={contract.riskScore > 60 ? "text-destructive" : "text-muted-foreground"}>
                            Risk Score: {contract.riskScore}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 border rounded-lg bg-card">
              <p className="text-muted-foreground mb-4">No contracts associated with this matter.</p>
              <Link href="/contracts?new=true">
                <Button variant="outline">Create Contract</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="pt-6">
          <div className="text-center py-12 border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">Select the Documents tab to view analysis.</p>
            <Link href="/documents?new=true">
              <Button variant="outline">Upload Document</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="pt-6">
           <div className="text-center py-12 border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">Manage deadlines directly from the Deadlines view.</p>
            <Link href="/deadlines?new=true">
              <Button variant="outline">Add Deadline</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the matter "{matter.name}" and remove it from our servers. 
              Contracts and documents associated with it will lose their matter association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMatter.isPending ? "Deleting..." : "Delete Matter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MatterDetailSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
           <Skeleton className="h-64 w-full" />
           <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
