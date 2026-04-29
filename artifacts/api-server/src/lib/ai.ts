import { openai } from "./openai";

const MODEL = "gpt-5.4";

const JURISDICTION_NAMES: Record<string, string> = {
  india: "India",
  uk: "United Kingdom",
  us: "United States",
};

const CONTRACT_TYPE_NAMES: Record<string, string> = {
  nda: "Non-Disclosure Agreement",
  msa: "Master Services Agreement",
  employment: "Employment Agreement",
  lease: "Lease Agreement",
  spa: "Share Purchase Agreement",
  services: "Services Agreement",
  partnership: "Partnership Agreement",
  licensing: "Licensing Agreement",
  consulting: "Consulting Agreement",
  other: "Contract",
};

function jurisdictionName(j: string): string {
  return JURISDICTION_NAMES[j] ?? j;
}

function contractTypeName(t: string): string {
  return CONTRACT_TYPE_NAMES[t] ?? "Contract";
}

async function chatJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from model");
  }
  return JSON.parse(content) as T;
}

async function chatText(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from model");
  }
  return content.trim();
}

export type RiskFlag = {
  clause: string;
  severity: "low" | "medium" | "high" | "critical";
  explanation: string;
};

export type ClauseAnalysis = {
  clause: string;
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
  recommendation?: string | null;
};

export type Citation = {
  caseName: string;
  citation: string;
  court?: string | null;
  year?: number | null;
  summary: string;
  relevance?: string | null;
};

export async function draftContract(args: {
  title: string;
  type: string;
  jurisdiction: string;
  counterparty?: string | null;
  prompt: string;
}): Promise<string> {
  const system = `You are an expert ${jurisdictionName(args.jurisdiction)} legal drafter. Produce a complete, professional ${contractTypeName(args.type)} that is clean, well-structured, and ready for attorney review. Use proper section numbering, headings in CAPITALS, and clear defined terms. Do not include any commentary, preamble, or markdown — output ONLY the raw contract text.`;
  const user = `Draft a ${contractTypeName(args.type)} titled "${args.title}" governed by the laws of ${jurisdictionName(args.jurisdiction)}.${
    args.counterparty ? ` The counterparty is ${args.counterparty}.` : ""
  }

Deal description from the attorney:
${args.prompt}

Include all standard sections (parties, recitals, definitions, core obligations, term, termination, confidentiality where relevant, indemnification, limitation of liability, governing law, dispute resolution, notices, miscellaneous, signature block). Use jurisdiction-appropriate clauses.`;
  return chatText(system, user);
}

export async function analyzeContractContent(args: {
  type: string;
  jurisdiction: string;
  content: string;
}): Promise<{ riskScore: number; riskFlags: RiskFlag[]; summary: string }> {
  const system = `You are a senior ${jurisdictionName(args.jurisdiction)} contracts lawyer reviewing a ${contractTypeName(args.type)} for risk. Output ONLY valid JSON matching exactly this shape: {"riskScore": <integer 0-100>, "summary": "<1-2 sentence overall assessment>", "riskFlags": [{"clause": "<short clause label>", "severity": "<low|medium|high|critical>", "explanation": "<1-2 sentence explanation>"}]}. Identify 3-8 of the most material risks. riskScore: 0-25 low, 26-50 medium, 51-75 high, 76-100 critical.`;
  const user = `Contract:
\`\`\`
${args.content.slice(0, 12000)}
\`\`\``;
  const result = await chatJson<{
    riskScore: number;
    summary: string;
    riskFlags: RiskFlag[];
  }>(system, user);
  return {
    riskScore: Math.max(0, Math.min(100, Math.round(result.riskScore))),
    summary: result.summary,
    riskFlags: Array.isArray(result.riskFlags) ? result.riskFlags : [],
  };
}

export async function analyzeDocumentContent(args: {
  jurisdiction: string;
  content: string;
}): Promise<{
  summary: string;
  riskScore: number;
  clauseAnalysis: ClauseAnalysis[];
}> {
  const system = `You are a senior ${jurisdictionName(args.jurisdiction)} lawyer performing clause-by-clause analysis of a legal document. Output ONLY valid JSON matching exactly this shape: {"summary": "<2-3 sentence overall summary>", "riskScore": <integer 0-100>, "clauseAnalysis": [{"clause": "<clause name or section>", "summary": "<plain-English summary of what it does>", "severity": "<low|medium|high|critical>", "recommendation": "<short action recommendation, or null>"}]}. Cover 5-10 of the most important clauses.`;
  const user = `Document:
\`\`\`
${args.content.slice(0, 12000)}
\`\`\``;
  const result = await chatJson<{
    summary: string;
    riskScore: number;
    clauseAnalysis: ClauseAnalysis[];
  }>(system, user);
  return {
    summary: result.summary,
    riskScore: Math.max(0, Math.min(100, Math.round(result.riskScore))),
    clauseAnalysis: Array.isArray(result.clauseAnalysis)
      ? result.clauseAnalysis
      : [],
  };
}

export async function generateBrief(args: {
  originalText: string;
  complexity: "basic" | "standard" | "detailed";
}): Promise<{ plainEnglish: string; keyPoints: string[] }> {
  const tone =
    args.complexity === "basic"
      ? "Use very simple language a non-lawyer client would understand. Aim for short paragraphs."
      : args.complexity === "detailed"
      ? "Provide a thorough plain-English breakdown that still preserves nuance. Multiple paragraphs allowed."
      : "Use clear, professional plain-English suitable for an informed business client.";
  const system = `You translate dense legal text into plain-English client briefs. Output ONLY valid JSON matching exactly: {"plainEnglish": "<the rewritten brief>", "keyPoints": ["<bullet 1>", "<bullet 2>", ...]}. ${tone} Provide 3-6 key points capturing the most important takeaways.`;
  const user = `Original legal text:
\`\`\`
${args.originalText.slice(0, 12000)}
\`\`\``;
  return chatJson<{ plainEnglish: string; keyPoints: string[] }>(system, user);
}

export async function runResearch(args: {
  question: string;
  jurisdiction: string;
}): Promise<{
  summary: string;
  riskFlags: string[];
  citations: Citation[];
}> {
  const system = `You are an expert ${jurisdictionName(args.jurisdiction)} legal researcher. Answer the attorney's question with a careful summary of the applicable law and 3-5 leading precedents. Output ONLY valid JSON matching exactly: {"summary": "<2-4 paragraph plain-English answer>", "riskFlags": ["<short risk or caveat>", ...], "citations": [{"caseName": "<plaintiff v. defendant>", "citation": "<reporter citation>", "court": "<court>", "year": <integer>, "summary": "<1-2 sentence holding>", "relevance": "<how this applies to the question>"}]}. Be honest about uncertainty. Only cite well-known cases you are confident exist; if unsure, omit them.`;
  const user = `Jurisdiction: ${jurisdictionName(args.jurisdiction)}\n\nQuestion:\n${args.question}`;
  const result = await chatJson<{
    summary: string;
    riskFlags: string[];
    citations: Citation[];
  }>(system, user);
  return {
    summary: result.summary,
    riskFlags: Array.isArray(result.riskFlags) ? result.riskFlags : [],
    citations: Array.isArray(result.citations) ? result.citations : [],
  };
}
