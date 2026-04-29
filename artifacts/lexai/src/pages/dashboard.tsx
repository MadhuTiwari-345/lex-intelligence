import React from "react";
import { Link } from "wouter";
import { 
  useGetDashboardSummary, 
  useGetRecentActivity, 
  useGetRiskOverview, 
  useListUpcomingDeadlines 
} from "@workspace/api-client-react";
import { 
  Briefcase, 
  FileText, 
  Files, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Search,
  Plus,
  ScrollText,
  CalendarClock,
  MessageSquare,
  Calendar
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: risk, isLoading: isLoadingRisk } = useGetRiskOverview();
  const { data: deadlines, isLoading: isLoadingDeadlines } = useListUpcomingDeadlines();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your legal intelligence workspace summary.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Active Matters" 
          value={summary?.activeMatterCount} 
          subtitle={`Out of ${summary?.matterCount || 0} total`}
          icon={Briefcase}
          isLoading={isLoadingSummary}
        />
        <KpiCard 
          title="Contracts in Review" 
          value={summary?.draftContractCount} 
          subtitle={`Out of ${summary?.contractCount || 0} total`}
          icon={FileText}
          isLoading={isLoadingSummary}
        />
        <KpiCard 
          title="Upcoming Deadlines" 
          value={summary?.upcomingDeadlineCount} 
          subtitle={summary?.overdueDeadlineCount ? `${summary.overdueDeadlineCount} overdue` : "None overdue"}
          icon={Clock}
          isLoading={isLoadingSummary}
          alert={summary?.overdueDeadlineCount ? true : false}
        />
        <KpiCard 
          title="Avg. Risk Score" 
          value={summary?.averageRiskScore ? `${summary.averageRiskScore}%` : undefined} 
          subtitle={`${summary?.highRiskCount || 0} high risk items`}
          icon={TrendingUp}
          isLoading={isLoadingSummary}
          alert={(summary?.averageRiskScore || 0) > 40}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Deadlines & Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Deadlines */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-serif">Upcoming Deadlines</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </div>
              <Link href="/deadlines">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingDeadlines ? (
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !deadlines?.length ? (
                <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg mt-4">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No upcoming deadlines</p>
                  <p className="text-xs mt-1">You're all caught up for the week.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {deadlines.slice(0, 5).map((deadline) => {
                    const isOverdue = deadline.status === 'missed' || new Date(deadline.dueDate) < new Date();
                    return (
                      <div key={deadline.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                        <div className={`mt-0.5 p-2 rounded-md ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          {isOverdue ? <AlertTriangle size={16} /> : <Calendar size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{deadline.title}</h4>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {deadline.matterName || "General"} • {deadline.type.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <p className={`text-xs font-medium ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                            {format(parseISO(deadline.dueDate), 'MMM d, yyyy')}
                          </p>
                          <Badge variant={deadline.priority === 'high' ? 'destructive' : 'outline'} className="mt-1 text-[10px] uppercase">
                            {deadline.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : !activity?.length ? (
                <p className="text-sm text-muted-foreground py-4">No recent activity.</p>
              ) : (
                <div className="relative mt-4 pl-4 border-l border-border space-y-6">
                  {activity.slice(0, 5).map((item, idx) => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-card" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {format(parseISO(item.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                        <Badge variant="secondary" className="w-fit text-[10px] mt-1 capitalize">
                          {item.kind}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Risk & Quick Actions */}
        <div className="space-y-8">
          {/* Risk Overview */}
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                Risk Distribution
              </CardTitle>
              <CardDescription>Across all analyzed documents</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRisk ? (
                <Skeleton className="h-40 w-full mt-4" />
              ) : (
                <div className="space-y-6 mt-2">
                  <RiskBar label="Critical" value={risk?.critical} total={summary?.documentCount || 1} color="bg-destructive" />
                  <RiskBar label="High" value={risk?.high} total={summary?.documentCount || 1} color="bg-orange-500" />
                  <RiskBar label="Medium" value={risk?.medium} total={summary?.documentCount || 1} color="bg-yellow-500" />
                  <RiskBar label="Low" value={risk?.low} total={summary?.documentCount || 1} color="bg-green-500" />
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-4 text-xs text-muted-foreground flex justify-between">
              <span>Updated today</span>
              <Link href="/contracts" className="text-primary font-medium hover:underline">Review flags</Link>
            </CardFooter>
          </Card>

          {/* Quick Links */}
          <Card className="shadow-sm bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/contracts?new=true" className="block w-full">
                <Button variant="secondary" className="w-full justify-start hover:bg-secondary/90">
                  <FileText className="mr-2 h-4 w-4" /> Draft Contract with AI
                </Button>
              </Link>
              <Link href="/research?new=true" className="block w-full">
                <Button variant="secondary" className="w-full justify-start hover:bg-secondary/90">
                  <Search className="mr-2 h-4 w-4" /> Start Case Law Research
                </Button>
              </Link>
              <Link href="/briefs?new=true" className="block w-full">
                <Button variant="secondary" className="w-full justify-start hover:bg-secondary/90">
                  <MessageSquare className="mr-2 h-4 w-4" /> Generate Client Brief
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, isLoading, alert }: any) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className={`text-3xl font-bold tracking-tight ${alert ? 'text-destructive' : 'text-foreground'}`}>
              {value !== undefined ? value : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RiskBar({ label, value = 0, total, color }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="text-muted-foreground">{value} items</span>
      </div>
      <Progress value={percentage} className="h-2" indicatorClassName={color} />
    </div>
  );
}
