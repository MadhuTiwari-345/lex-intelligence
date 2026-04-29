import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, FileText, Trash2, MoreVertical, Sparkles, AlertTriangle, Info, CheckCircle2 
} from "lucide-react";

import { 
  useGetContract, 
  useUpdateContract,
  useDeleteContract,
  useAnalyzeContract,
  getGetContractQueryKey,
  getListContractsQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { ContractStatus } from "@workspace/api-client-react/src/generated/api.schemas";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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

export default function ContractDetail({ params }: { params: { id: string } }) {
  const contractId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: contract, isLoading } = useGetContract(contractId);

  const updateContract = useUpdateContract({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetContractQueryKey(contractId) });
        queryClient.invalidateQueries({ queryKey: getListContractsQueryKey() });
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" })
    }
  });

  const deleteContract = useDeleteContract({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContractsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Contract deleted" });
        setLocation("/contracts");
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" })
    }
  });

  const analyzeContract = useAnalyzeContract({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetContractQueryKey(contractId) });
        toast({ title: "Analysis complete" });
      },
      onError: () => toast({ title: "Analysis failed", variant: "destructive" })
    }
  });

  if (isLoading) return <ContractDetailSkeleton />;
  if (!contract) return <div className="text-center py-20">Contract not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-7xl mx-auto gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/contracts" className="hover:text-foreground transition-colors flex items-center">
              <ArrowLeft className="mr-1 h-3 w-3" /> Contracts
            </Link>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-3">
            <FileText className="text-primary" size={24} /> {contract.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{contract.type}</Badge>
            <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{contract.jurisdiction}</Badge>
            <Badge variant={contract.status === 'signed' ? 'default' : contract.status === 'review' ? 'secondary' : 'outline'}>
              {contract.status}
            </Badge>
            {contract.counterparty && <span className="text-sm text-muted-foreground">• With {contract.counterparty}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!contract.riskScore && !analyzeContract.isPending && (
            <Button onClick={() => analyzeContract.mutate({ id: contractId })} className="bg-primary hover:bg-primary/90 gap-2">
              <Sparkles size={16} /> Run Analysis
            </Button>
          )}
          {analyzeContract.isPending && (
            <Button disabled className="gap-2">
              <Sparkles size={16} className="animate-pulse" /> Analyzing...
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"><MoreVertical size={16} /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateContract.mutate({ id: contractId, data: { status: 'draft' } })} disabled={contract.status === 'draft'}>Mark as Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateContract.mutate({ id: contractId, data: { status: 'review' } })} disabled={contract.status === 'review'}>Mark as Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateContract.mutate({ id: contractId, data: { status: 'signed' } })} disabled={contract.status === 'signed'}>Mark as Signed</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content & Analysis Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <Card className="lg:col-span-2 flex flex-col min-h-0 shadow-sm">
          <CardHeader className="py-4 shrink-0 border-b">
            <CardTitle className="text-sm font-medium">Document Content</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none font-mono whitespace-pre-wrap text-xs leading-relaxed">
                  {contract.content}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 min-h-0">
          <Card className="shrink-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.riskScore !== undefined && contract.riskScore !== null ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold font-serif">{contract.riskScore}<span className="text-muted-foreground text-lg">/100</span></div>
                    <Badge variant={contract.riskScore > 60 ? 'destructive' : contract.riskScore > 30 ? 'outline' : 'secondary'} className={contract.riskScore > 30 && contract.riskScore <= 60 ? "border-orange-500 text-orange-500" : ""}>
                      {contract.riskScore > 60 ? 'High Risk' : contract.riskScore > 30 ? 'Medium Risk' : 'Low Risk'}
                    </Badge>
                  </div>
                  <Progress value={contract.riskScore} className="h-2" indicatorClassName={contract.riskScore > 60 ? 'bg-destructive' : contract.riskScore > 30 ? 'bg-orange-500' : 'bg-green-500'} />
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">Contract has not been analyzed yet.</p>
                  <Button variant="outline" size="sm" onClick={() => analyzeContract.mutate({ id: contractId })} disabled={analyzeContract.isPending}>
                    {analyzeContract.isPending ? "Analyzing..." : "Analyze Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col min-h-0 shadow-sm">
            <CardHeader className="py-4 shrink-0 border-b">
              <CardTitle className="text-sm font-medium">Identified Flags</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {!contract.riskFlags?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No flags identified.</p>
                  ) : (
                    contract.riskFlags.map((flag, idx) => (
                      <div key={idx} className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                          {flag.severity === 'critical' && <AlertTriangle size={14} className="text-destructive" />}
                          {flag.severity === 'high' && <AlertTriangle size={14} className="text-orange-500" />}
                          {flag.severity === 'medium' && <Info size={14} className="text-yellow-500" />}
                          {flag.severity === 'low' && <CheckCircle2 size={14} className="text-green-500" />}
                          <Badge variant="outline" className={`text-[10px] uppercase
                            ${flag.severity === 'critical' ? 'border-destructive text-destructive' : 
                              flag.severity === 'high' ? 'border-orange-500 text-orange-500' : 
                              flag.severity === 'medium' ? 'border-yellow-500 text-yellow-500' : 
                              'border-green-500 text-green-500'}`
                          }>
                            {flag.severity}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold mb-1">{flag.clause}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{flag.explanation}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this contract? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteContract.mutate({ id: contractId })} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ContractDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-20 w-1/2" />
      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        <Skeleton className="lg:col-span-2 h-full w-full" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-[444px] w-full" />
        </div>
      </div>
    </div>
  );
}
