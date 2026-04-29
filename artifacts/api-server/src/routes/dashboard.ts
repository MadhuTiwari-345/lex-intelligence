import { Router, type IRouter } from "express";
import { and, desc, eq, gte, lt, sql, isNotNull } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  db,
  mattersTable,
  contractsTable,
  documentsTable,
  deadlinesTable,
  researchQueriesTable,
  briefsTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const now = new Date();

  const [{ count: matterCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mattersTable);
  const [{ count: activeMatterCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mattersTable)
    .where(eq(mattersTable.status, "active"));

  const [{ count: contractCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contractsTable);
  const [{ count: draftContractCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contractsTable)
    .where(eq(contractsTable.status, "draft"));

  const [{ count: documentCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documentsTable);

  const [{ count: upcomingDeadlineCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deadlinesTable)
    .where(
      and(
        eq(deadlinesTable.status, "upcoming"),
        gte(deadlinesTable.dueDate, now),
      ),
    );
  const [{ count: overdueDeadlineCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deadlinesTable)
    .where(
      and(
        eq(deadlinesTable.status, "upcoming"),
        lt(deadlinesTable.dueDate, now),
      ),
    );

  const [{ count: researchCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(researchQueriesTable);
  const [{ count: briefCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(briefsTable);

  const [contractRisk] = await db
    .select({
      avg: sql<number>`coalesce(avg(${contractsTable.riskScore}), 0)::float`,
      high: sql<number>`coalesce(sum(case when ${contractsTable.riskScore} >= 51 then 1 else 0 end), 0)::int`,
    })
    .from(contractsTable)
    .where(isNotNull(contractsTable.riskScore));
  const [documentRisk] = await db
    .select({
      avg: sql<number>`coalesce(avg(${documentsTable.riskScore}), 0)::float`,
      high: sql<number>`coalesce(sum(case when ${documentsTable.riskScore} >= 51 then 1 else 0 end), 0)::int`,
    })
    .from(documentsTable)
    .where(isNotNull(documentsTable.riskScore));

  // Combined average across both, weighted by simple count
  const [contractCountWithScore] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contractsTable)
    .where(isNotNull(contractsTable.riskScore));
  const [documentCountWithScore] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documentsTable)
    .where(isNotNull(documentsTable.riskScore));

  const totalScored =
    contractCountWithScore.count + documentCountWithScore.count;
  const averageRiskScore =
    totalScored > 0
      ? (contractRisk.avg * contractCountWithScore.count +
          documentRisk.avg * documentCountWithScore.count) /
        totalScored
      : 0;

  res.json({
    matterCount,
    activeMatterCount,
    contractCount,
    draftContractCount,
    documentCount,
    upcomingDeadlineCount,
    overdueDeadlineCount,
    researchCount,
    briefCount,
    averageRiskScore: Math.round(averageRiskScore * 10) / 10,
    highRiskCount: contractRisk.high + documentRisk.high,
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const matters = await db
    .select({
      id: mattersTable.id,
      name: mattersTable.name,
      client: mattersTable.client,
      updatedAt: mattersTable.updatedAt,
    })
    .from(mattersTable)
    .orderBy(desc(mattersTable.updatedAt))
    .limit(10);
  const contracts = await db
    .select({
      id: contractsTable.id,
      title: contractsTable.title,
      status: contractsTable.status,
      matterId: contractsTable.matterId,
      updatedAt: contractsTable.updatedAt,
    })
    .from(contractsTable)
    .orderBy(desc(contractsTable.updatedAt))
    .limit(10);
  const documents = await db
    .select({
      id: documentsTable.id,
      title: documentsTable.title,
      matterId: documentsTable.matterId,
      createdAt: documentsTable.createdAt,
    })
    .from(documentsTable)
    .orderBy(desc(documentsTable.createdAt))
    .limit(10);
  const research = await db
    .select({
      id: researchQueriesTable.id,
      question: researchQueriesTable.question,
      matterId: researchQueriesTable.matterId,
      createdAt: researchQueriesTable.createdAt,
    })
    .from(researchQueriesTable)
    .orderBy(desc(researchQueriesTable.createdAt))
    .limit(10);
  const briefs = await db
    .select({
      id: briefsTable.id,
      title: briefsTable.title,
      matterId: briefsTable.matterId,
      createdAt: briefsTable.createdAt,
    })
    .from(briefsTable)
    .orderBy(desc(briefsTable.createdAt))
    .limit(10);
  const deadlines = await db
    .select({
      id: deadlinesTable.id,
      title: deadlinesTable.title,
      matterId: deadlinesTable.matterId,
      createdAt: deadlinesTable.createdAt,
    })
    .from(deadlinesTable)
    .orderBy(desc(deadlinesTable.createdAt))
    .limit(10);

  type Activity = {
    id: string;
    kind: string;
    title: string;
    subtitle: string | null;
    timestamp: string;
    matterId: number | null;
  };

  const items: Activity[] = [
    ...matters.map((m) => ({
      id: `matter-${m.id}`,
      kind: "matter",
      title: m.name,
      subtitle: m.client,
      timestamp: m.updatedAt.toISOString(),
      matterId: m.id,
    })),
    ...contracts.map((c) => ({
      id: `contract-${c.id}`,
      kind: "contract",
      title: c.title,
      subtitle: `Contract · ${c.status}`,
      timestamp: c.updatedAt.toISOString(),
      matterId: c.matterId,
    })),
    ...documents.map((d) => ({
      id: `document-${d.id}`,
      kind: "document",
      title: d.title,
      subtitle: "Document uploaded",
      timestamp: d.createdAt.toISOString(),
      matterId: d.matterId,
    })),
    ...research.map((r) => ({
      id: `research-${r.id}`,
      kind: "research",
      title: r.question,
      subtitle: "Research query",
      timestamp: r.createdAt.toISOString(),
      matterId: r.matterId,
    })),
    ...briefs.map((b) => ({
      id: `brief-${b.id}`,
      kind: "brief",
      title: b.title,
      subtitle: "Client brief generated",
      timestamp: b.createdAt.toISOString(),
      matterId: b.matterId,
    })),
    ...deadlines.map((d) => ({
      id: `deadline-${d.id}`,
      kind: "deadline",
      title: d.title,
      subtitle: "Deadline added",
      timestamp: d.createdAt.toISOString(),
      matterId: d.matterId,
    })),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 15);

  res.json(items);
});

router.get("/dashboard/risk-overview", async (_req, res): Promise<void> => {
  const bucket = (col: AnyPgColumn) => ({
    low: sql<number>`coalesce(sum(case when ${col} between 0 and 25 then 1 else 0 end), 0)::int`,
    medium: sql<number>`coalesce(sum(case when ${col} between 26 and 50 then 1 else 0 end), 0)::int`,
    high: sql<number>`coalesce(sum(case when ${col} between 51 and 75 then 1 else 0 end), 0)::int`,
    critical: sql<number>`coalesce(sum(case when ${col} between 76 and 100 then 1 else 0 end), 0)::int`,
  });

  const [c] = await db
    .select(bucket(contractsTable.riskScore))
    .from(contractsTable);
  const [d] = await db
    .select(bucket(documentsTable.riskScore))
    .from(documentsTable);

  res.json({
    low: c.low + d.low,
    medium: c.medium + d.medium,
    high: c.high + d.high,
    critical: c.critical + d.critical,
  });
});

export default router;
