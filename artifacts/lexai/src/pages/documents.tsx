import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
  Files, 
  Search, 
  Plus, 
  UploadCloud,
  AlertTriangle
} from "lucide-react";

import { 
  useListDocuments, 
  useCreateDocument, 
  getListDocumentsQueryKey,
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
  jurisdiction: z.enum(["india", "uk", "us"]),
  docType: z.string().optional(),
  matterId: z.coerce.number().optional().nullable(),
  content: z.string().min(1, "Document content is required"),
});

export default function Documents() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('new') === 'true' && !isCreateOpen) {
    setIsCreateOpen(true);
    window.history.replaceState({}, '', '/documents');
  }

  const { data: documents, isLoading } = useListDocuments();
  const { data: matters } = useListMatters();

  const createDoc = useCreateDocument({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Document uploaded successfully" });
        setIsCreateOpen(false);
        setLocation(`/documents/${data.id}`);
      },
      onError: () => toast({ title: "Upload failed", variant: "destructive" })
    }
  });

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { title: "", jurisdiction: "us", docType: "", content: "", matterId: null },
  });

  const filteredDocs = documents?.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    (d.docType && d.docType.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1 text-sm">Store, analyze, and manage legal documents.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
          <UploadCloud size={16} /> Upload Document
        </Button>
      </div>

      <div className="flex items-center bg-card p-2 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents by title or type..." 
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : !filteredDocs?.length ? (
           <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
            <Files className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No documents found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Upload a document to store and analyze it.</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <Card key={doc.id} className="hover-elevate cursor-pointer transition-all border-border/50" onClick={() => setLocation(`/documents/${doc.id}`)}>
              <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-secondary p-2 rounded text-secondary-foreground shrink-0">
                    <Files size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2" title={doc.title}>{doc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Added {format(parseISO(doc.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase">{doc.jurisdiction}</Badge>
                    {doc.docType && <Badge variant="secondary" className="text-[10px] bg-muted">{doc.docType}</Badge>}
                  </div>
                  {doc.riskScore !== undefined && doc.riskScore !== null && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${doc.riskScore > 60 ? 'text-destructive' : doc.riskScore > 30 ? 'text-orange-500' : 'text-green-600'}`}>
                      {doc.riskScore > 60 && <AlertTriangle size={12} />}
                      {doc.riskScore}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Document Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Upload Document</DialogTitle>
            <DialogDescription>Paste document text for storage and AI analysis.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => createDoc.mutate({ data: v }))} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g. Discovery Response Part 1" {...field} /></FormControl><FormMessage /></FormItem>
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
                <FormField control={form.control} name="docType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Affidavit, Motion, Email" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="matterId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Matter <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))} value={field.value ? field.value.toString() : "none"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a matter" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">No matter (Standalone document)</SelectItem>
                      {matters?.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Text</FormLabel>
                  <FormControl><Textarea className="h-40 font-mono text-xs" placeholder="Paste the full text of the document here..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createDoc.isPending}>{createDoc.isPending ? "Uploading..." : "Upload Document"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
