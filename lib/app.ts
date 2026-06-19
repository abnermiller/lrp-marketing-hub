// LRP app: integrations + dashboard aggregator (imports shared code from ./core)
import { config } from "./core.js";
import { sampleBrands, sampleScheduledPosts, sampleBestTimesInstagram } from "./core.js";
import { sampleGscQueries, sampleGscTotals, sampleGbp, sampleGa4 } from "./core.js";
import { aggregateBestTimes, groupPostsByDay, analyzeSearchConsole, buildWhatToWorkOn } from "./core.js";
import type { Brand, ScheduledPost, BestTimeDay, GscQuery, GscTotals } from "./core.js";


// ===== integrations/metricool.ts =====
// Metricool integration. Endpoints are illustrative scaffolds; in mock mode we
// return the real LRP data captured this session. Swap in your API token to go live.




const API = "https://app.metricool.com/api";
interface MetricoolList<T> { data?: T[] }

export async function getBrands(): Promise<Brand[]> {
  if (config.metricool.mock) return sampleBrands;
  const url = `${API}/admin/simpleProfiles?userId=${config.metricool.userId}&userToken=${config.metricool.token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Metricool brands ${res.status}`);
  const json = (await res.json()) as MetricoolList<Brand>;
  return json.data ?? [];
}

export async function getScheduledPosts(
  brandId: string, fromIso: string, toIso: string, timezone = "America/New_York",
): Promise<ScheduledPost[]> {
  if (config.metricool.mock) return sampleScheduledPosts;
  const url = `${API}/v2/scheduler/posts?blogId=${brandId}` +
    `&start=${encodeURIComponent(fromIso)}&end=${encodeURIComponent(toIso)}` +
    `&timezone=${encodeURIComponent(timezone)}&userId=${config.metricool.userId}&userToken=${config.metricool.token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Metricool posts ${res.status}`);
  const json = (await res.json()) as MetricoolList<ScheduledPost>;
  return json.data ?? [];
}

export async function getBestTimes(brandId: string, network = "instagram"): Promise<BestTimeDay[]> {
  if (config.metricool.mock) return sampleBestTimesInstagram;
  const url = `${API}/v2/analytics/besttimes?blogId=${brandId}&network=${network}` +
    `&userId=${config.metricool.userId}&userToken=${config.metricool.token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Metricool besttimes ${res.status}`);
  const json = (await res.json()) as MetricoolList<BestTimeDay>;
  return json.data ?? [];
}

// ===== integrations/searchconsole.ts =====
// Google Search Console (Search Analytics API). Mock mode returns the real snapshot.




export interface GscResult { totals: GscTotals; queries: GscQuery[] }
interface GscRow { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }

export async function getSearchConsole(fromDate: string, toDate: string): Promise<GscResult> {
  if (config.google.mock) return { totals: sampleGscTotals, queries: sampleGscQueries };
  const prop = encodeURIComponent(config.google.gscProperty);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${prop}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.google.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate: fromDate, endDate: toDate, dimensions: ["query"], rowLimit: 25 }),
  });
  if (!res.ok) throw new Error(`GSC ${res.status}`);
  const json = (await res.json()) as { rows?: GscRow[] };
  const rows = json.rows ?? [];
  const queries: GscQuery[] = rows.map((r) => ({ query: r.keys[0] ?? "", clicks: r.clicks, impressions: r.impressions }));
  const clicks = rows.reduce((a, r) => a + r.clicks, 0);
  const impressions = rows.reduce((a, r) => a + r.impressions, 0);
  const totals: GscTotals = {
    clicks, impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: rows.length ? rows.reduce((a, r) => a + r.position, 0) / rows.length : 0,
  };
  return { totals, queries };
}

// ===== integrations/ga4.ts =====
// Google Analytics 4 (Data API). Mock mode reflects the real finding: not collecting.



export interface Ga4Result { measurementId: string; collecting: boolean; sessions: number; conversions: number }

export async function getGa4(): Promise<Ga4Result> {
  if (config.google.mock) {
    return { measurementId: sampleGa4.measurementId, collecting: sampleGa4.collecting, sessions: 0, conversions: 0 };
  }
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.google.ga4Property}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.google.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }],
    }),
  });
  if (!res.ok) throw new Error(`GA4 ${res.status}`);
  const json = (await res.json()) as { rows?: { metricValues: { value: string }[] }[] };
  const row = json.rows?.[0];
  const sessions = row ? Number(row.metricValues[0]?.value ?? 0) : 0;
  const conversions = row ? Number(row.metricValues[1]?.value ?? 0) : 0;
  return { measurementId: config.google.ga4MeasurementId, collecting: sessions > 0, sessions, conversions };
}

// ===== integrations/serpbear.ts =====
// SerpBear (self-hosted rank tracker). Mock mode derives sample ranks from GSC queries.



export interface RankRow { keyword: string; position: number }

export async function getRankings(): Promise<RankRow[]> {
  if (config.serpbear.mock) {
    return sampleGscQueries.slice(0, 8).map((q, i) => ({ keyword: q.query, position: 8 + i * 3 }));
  }
  const res = await fetch(`${config.serpbear.url}/api/keywords`, {
    headers: { Authorization: `Bearer ${config.serpbear.apiKey}` },
  });
  if (!res.ok) throw new Error(`SerpBear ${res.status}`);
  const json = (await res.json()) as { keywords?: { keyword: string; position: number }[] };
  return (json.keywords ?? []).map((k) => ({ keyword: k.keyword, position: k.position }));
}

// ===== dashboard.ts =====
// Server-side aggregator: pulls every source and runs the transforms into one payload.








function pad(n: number): string { return String(n).padStart(2, "0"); }
function isoDay(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00-04:00`; }
function ymd(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function addDays(d: Date, n: number): Date { const c = new Date(d); c.setDate(c.getDate() + n); return c; }

export async function getDashboard(opts?: { from?: string; to?: string }) {
  const now = new Date();
  const from = opts?.from ?? isoDay(now);
  const to = opts?.to ?? isoDay(addDays(now, 8));
  const [brands, posts, bestTimes, gsc, ga4, rankings] = await Promise.all([
    getBrands(),
    getScheduledPosts(config.metricool.mainBrandId, from, to),
    getBestTimes(config.metricool.mainBrandId, "instagram"),
    getSearchConsole(ymd(addDays(now, -90)), ymd(now)),
    getGa4(),
    getRankings(),
  ]);
  const schedule = groupPostsByDay(posts);
  const heatmap = aggregateBestTimes(bestTimes);
  const seo = analyzeSearchConsole(gsc.queries, gsc.totals);
  const gbp = sampleGbp;
  const work = buildWhatToWorkOn({
    ga4NoData: !ga4.collecting,
    adsPaused: gbp.adsStatus === "paused",
    photosAgeDays: gbp.photosAgeDays,
    opportunities: seo.opportunities,
    reviewNewCount: gbp.newReviews,
    ga4DuplicateProperty: true,
  });
  return { brands, schedule, heatmap, seo, ga4, rankings, gbp, work };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

// re-export shared code so consumers can import everything from ./app
export * from "./core.js";

