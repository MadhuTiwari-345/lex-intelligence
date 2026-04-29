import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Search, Trash2, BookOpen, AlertTriangle, Scale, GraduationCap
} from "lucide-react";

import { 
  useGetResearchQuery, 
  useDeleteResearchQuery,
  getGetResearchQueryKey,
  getListResearchQueriesQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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

export default function ResearchDetail({ params }: { params: { id: string } }) {
  const queryId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: research, isLoading } = useGetResearchQuery(queryId);

  const deleteQuery = useDeleteResearchQuery({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListResearchQueriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Research deleted" });
        setLocation("/research");
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" })
    }
  });

  if (isLoading) return <ResearchDetailSkeleton />;
  if (!research) return <div className="text-center py-20">Research not found</div>;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-5xl mx-auto gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-foreground transition-colors flex items-center">
              <ArrowLeft className="mr-1 h-3 w-3" /> Research History
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground leading-snug">
            {research.question}
          </h1>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <Badge variant="secondary" className="uppercase tracking-wider text-[10px] bg-primary/10 text-primary border-none">
              Jurisdiction: {research.jurisdiction}
            </Badge>
            {research.matterId && <span className="text-sm text-muted-foreground font-medium">• Matter #{research.matterId}</span>}
          </div>
        </div>

        <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0">
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Synthesis */}
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground/90">
                {research.summary.split('\n').map((para, i) => (
                  <p key={i} className="mb-4 last:mb-0">{para}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Citations */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
              <Scale size={18} className="text-muted-foreground" /> Precedents & Citations
            </h3>
            
            {!research.citations?.length ? (
              <Card className="bg-muted/30 border-dashed shadow-none"><CardContent className="py-8 text-center text-muted-foreground text-sm">No specific citations provided.</CardContent></Card>
            ) : (
              <Accordion type="multiple" className="w-full space-y-4">
                {research.citations.map((cite, i) => (
                  <AccordionItem value={`cite-${i}`} key={i} className="border rounded-lg bg-card shadow-sm overflow-hidden px-1">
                    <AccordionTrigger className="hover:no-underline px-4 py-4">
                      <div className="flex flex-col items-start text-left gap-1">
                        <span className="font-semibold text-[15px] italic text-foreground leading-tight">{cite.caseName}</span>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-normal">
                          <Badge variant="secondary" className="text-[10px] font-mono">{cite.citation}</Badge>
                          {cite.court && <span>{cite.court}</span>}
                          {cite.year && <span>({cite.year})</span>}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 border-t bg-muted/10">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Holding / Summary</span>
                          <p className="text-sm leading-relaxed text-foreground/90">{cite.summary}</p>
                        </div>
                        {cite.relevance && (
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1 block">Relevance to Query</span>
                            <p className="text-sm text-foreground/90">{cite.relevance}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {research.riskFlags && research.riskFlags.length > 0 && (
            <Card className="shadow-sm border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif flex items-center gap-2 text-orange-700 dark:text-orange-500">
                  <AlertTriangle size={16} /> Key Risks / Caveats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {research.riskFlags.map((flag, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-orange-900 dark:text-orange-200/80">
                      <span className="shrink-0 mt-1">•</span>
                      <span className="leading-snug">{flag}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm bg-muted/30 border-none">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <GraduationCap size={20} className="text-primary" />
                <div className="text-sm font-medium">AI generated research</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This synthesis was generated by LexAI. While citations reference real case law formats, always verify primary sources before relying on them for court filings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Research</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this research query and its citations?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteQuery.mutate({ id: queryId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ResearchDetailSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Skeleton className="h-12 w-3/4" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
