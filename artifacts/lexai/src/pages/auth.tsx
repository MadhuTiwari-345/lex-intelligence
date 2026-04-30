import { Link } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
import { Scale } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-md">
              <Scale size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-serif text-lg font-bold tracking-tight">LexAI</div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Legal Intelligence
              </div>
            </div>
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}

export function SignInPage() {
  return (
    <AuthShell>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/app`}
      />
    </AuthShell>
  );
}

export function SignUpPage() {
  return (
    <AuthShell>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/app`}
      />
    </AuthShell>
  );
}
