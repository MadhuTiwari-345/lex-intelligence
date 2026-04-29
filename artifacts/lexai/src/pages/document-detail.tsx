import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Files, Trash2, Sparkles, AlertTriangle, CheckCircle2, ChevronRight
} from "lucide-react";

import { 
  useGetDocument, 
  useDeleteDocument,
  useAnalyzeDocument,
  getGetDocumentQueryKey,
  getListDocumentsQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function DocumentDetail({ params }: { params: { id: string } }) {
  const documentId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: document, isLoading } = useGetDocument(documentId);

  const deleteDoc = useDeleteDocument({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Document deleted" });
        setLocation("/documents");
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" })
    }
  });

  const analyzeDoc = useAnalyzeDocument({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDocumentQueryKey(documentId) });
        toast({ title: "Analysis complete" });
      },
      onError: () => toast({ title: "Analysis failed", variant: "destructive" })
    }
  });

  if (isLoading) return <DocumentDetailSkeleton />;
  if (!document) return <div className="text-center py-20">Document not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-7xl mx-auto gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/documents" className="hover:text-foreground transition-colors flex items-center">
              <ArrowLeft className="mr-1 h-3 w-3" /> Documents
            </Link>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-3">
            <Files className="text-secondary-foreground" size={24} /> {document.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{document.jurisdiction}</Badge>
            {document.docType && <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">{document.docType}</Badge>}
            {document.matterId && <span className="text-sm text-muted-foreground">• Linked to Matter #{document.matterId}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!document.riskScore && !analyzeDoc.isPending && (
            <Button onClick={() => analyzeDoc.mutate({ id: documentId })} className="bg-primary hover:bg-primary/90 gap-2">
              <Sparkles size={16} /> Run Analysis
            </Button>
          )}
          {analyzeDoc.isPending && (
            <Button disabled className="gap-2">
              <Sparkles size={16} className="animate-pulse" /> Analyzing...
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {document.summary && (
        <Card className="shrink-0 bg-primary/5 border-primary/20 shadow-none">
          <CardContent className="p-4 flex gap-4">
            <Sparkles className="text-primary mt-1 shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-sm text-primary mb-1">AI Summary</h3>
              <p className="text-sm leading-relaxed">{document.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content & Analysis Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Card className="flex flex-col min-h-0 shadow-sm">
          <CardHeader className="py-4 shrink-0 border-b bg-muted/20">
            <CardTitle className="text-sm font-medium">Document Source</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none font-mono whitespace-pre-wrap text-xs leading-relaxed">
                  {document.content}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0 shadow-sm border-l-4 border-l-secondary">
          <CardHeader className="py-4 shrink-0 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Clause-by-Clause Analysis</CardTitle>
            {document.riskScore !== null && document.riskScore !== undefined && (
              <Badge variant={document.riskScore > 60 ? 'destructive' : 'secondary'}>
                Risk Score: {document.riskScore}%
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <ScrollArea className="h-full">
              {!document.clauseAnalysis?.length ? (
                <div className="text-center py-16 px-4">
                  <p className="text-sm text-muted-foreground mb-4">Run analysis to break down this document clause by clause.</p>
                  <Button variant="outline" onClick={() => analyzeDoc.mutate({ id: documentId })} disabled={analyzeDoc.isPending}>
                    {analyzeDoc.isPending ? "Analyzing..." : "Run Analysis"}
                  </Button>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {document.clauseAnalysis.map((clause, i) => (
                    <AccordionItem value={`item-${i}`} key={i} className="border-b-0 border-t first:border-t-0 px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-start gap-3 text-left w-full pr-4">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            clause.severity === 'critical' ? 'bg-destructive' :
                            clause.severity === 'high' ? 'bg-orange-500' :
                            clause.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium leading-tight">{clause.summary}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-1 pl-5">
                        <div className="space-y-4 text-sm bg-muted/30 p-4 rounded-md">
                          <div>
                            <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">Original Clause</span>
                            <p className="font-mono text-xs text-muted-foreground">{clause.clause}</p>
                          </div>
                          {clause.recommendation && (
                            <div>
                              <span className="font-semibold text-xs text-primary uppercase tracking-wider block mb-1">Recommendation</span>
                              <p className="text-foreground">{clause.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this document?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDoc.mutate({ id: documentId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DocumentDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-20 w-1/2" />
      <Skeleton className="h-24 w-full" />
      <div className="grid lg:grid-cols-2 gap-6 h-[500px]">
        <Skeleton className="h-full w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
