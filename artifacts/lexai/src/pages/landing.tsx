import { Link } from "wouter";
import { Scale, FileText, Search, ShieldCheck, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const features = [
  {
    icon: FileText,
    title: "Contract Drafting",
    body: "Generate jurisdiction-aware NDAs, MSAs, employment agreements and SAFEs in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Document Intelligence",
    body: "Upload a contract and surface risk flags, missing clauses and obligations automatically.",
  },
  {
    icon: Search,
    title: "Case Law Research",
    body: "Ask questions in plain English. Get answers grounded in US, UK and Indian authority.",
  },
  {
    icon: Globe,
    title: "Multi-Jurisdiction",
    body: "Toggle between United States, England & Wales and Indian law for every output.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-md">
              <Scale size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-serif text-lg font-bold tracking-tight">LexAI</div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Legal Intelligence
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" data-testid="link-signin">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" data-testid="link-signup">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card text-xs font-medium tracking-wider uppercase text-muted-foreground mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          For solo lawyers, boutique firms & in-house teams
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-4xl mx-auto">
          The legal workspace that drafts, reviews and researches
          <span className="text-primary"> alongside you.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          LexAI brings contract drafting, risk scoring, deadline tracking and case-law research
          into a single boutique-grade workspace — tuned to US, UK and Indian law.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2 shadow-sm" data-testid="cta-primary">
              Create your account <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" data-testid="cta-secondary">
              Sign in
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required. Talk to sales for Enterprise & on-premise.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border/60 rounded-xl p-5"
              data-testid={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                <f.icon size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} LexAI. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href={`${basePath}/sign-in`}>Sign in</a>
            <a href={`${basePath}/sign-up`}>Get started</a>
            <a href="mailto:sales@lexai.app">Talk to sales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
