import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, MessageSquare, Trash2, Copy, Check, FileText
} from "lucide-react";

import { 
  useGetBrief, 
  useDeleteBrief,
  getGetBriefQueryKey,
  getListBriefsQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export default function BriefDetail({ params }: { params: { id: string } }) {
  const briefId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: brief, isLoading } = useGetBrief(briefId);

  const deleteBrief = useDeleteBrief({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBriefsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Brief deleted" });
        setLocation("/briefs");
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" })
    }
  });

  const handleCopy = () => {
    if (!brief) return;
    
    let textToCopy = `${brief.title}\n\n${brief.plainEnglish}`;
    if (brief.keyPoints?.length) {
      textToCopy += `\n\nKey Takeaways:\n${brief.keyPoints.map(p => `• ${p}`).join('\n')}`;
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <BriefDetailSkeleton />;
  if (!brief) return <div className="text-center py-20">Brief not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-7xl mx-auto gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/briefs" className="hover:text-foreground transition-colors flex items-center">
              <ArrowLeft className="mr-1 h-3 w-3" /> Client Briefs
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
            {brief.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge variant="outline" className="capitalize text-[10px] tracking-wider bg-muted/50">{brief.complexity} Detail</Badge>
            {brief.matterId && <span className="text-sm text-muted-foreground font-medium">• Matter #{brief.matterId}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handleCopy} variant="outline" className="gap-2">
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy to Email"}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {brief.keyPoints && brief.keyPoints.length > 0 && (
        <Card className="shrink-0 bg-primary border-none text-primary-foreground shadow-md">
          <CardContent className="p-6">
            <h3 className="font-serif font-bold text-lg mb-4 opacity-90">Key Takeaways</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brief.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 bg-primary-foreground/10 p-3 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 mt-2 shrink-0" />
                  <span className="text-sm leading-snug">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Side by Side Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Card className="flex flex-col min-h-0 shadow-sm border-l-4 border-l-primary">
          <CardHeader className="py-4 shrink-0 border-b bg-muted/10">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" /> Plain English Translation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 bg-card">
            <ScrollArea className="h-full w-full">
              <div className="p-6 md:p-8">
                <div className="prose prose-sm dark:prose-invert max-w-none leading-loose text-[15px]">
                  {brief.plainEnglish.split('\n').map((para, i) => (
                    <p key={i} className={para ? "mb-4" : "mb-0"}>{para}</p>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <CardHeader className="py-4 shrink-0 border-b bg-muted/30">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText size={16} /> Original Legalese
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <ScrollArea className="h-full w-full bg-muted/10">
              <div className="p-6">
                <div className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {brief.originalText}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brief</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this client brief?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteBrief.mutate({ id: briefId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BriefDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <Skeleton className="h-16 w-2/3 shrink-0" />
      <Skeleton className="h-32 w-full shrink-0" />
      <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <Skeleton className="h-full w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
