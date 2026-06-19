// LRP core: types, fixtures, config, transforms

// ===== types.ts =====
// Shared domain types for LRP Marketing Hub (framework-agnostic, unit-testable).

export interface Brand {
  id: number;
  label: string;
  title?: string;
  timezone?: string;
  networksData?: Record<string, string>;
}

export interface BestTimeDay {
  dayOfWeek: number; // ISO: 1 = Monday ... 7 = Sunday
  bestTimesByHour: { hourOfDay: number; value: number }[];
}

export interface HeatCell { day: number; hour: number; value: number }

export interface BestTimeHeatmap {
  matrix: number[][];
  max: number;
  topSlots: HeatCell[];
  dayOrder: number[];
}

export interface Provider { network: string; status?: string }

export interface ScheduledPost {
  id: number | string;
  publicationDate: { dateTime: string; timezone?: string };
  text?: string;
  providers?: Provider[];
  instagramData?: { type?: string };
  facebookData?: { type?: string };
  youtubeData?: { type?: string };
  tiktokData?: Record<string, unknown>;
  gmbData?: { type?: string };
  creatorUserMail?: string;
}

export type PostStatus = "pending" | "published" | "error";

export interface PostsSummary {
  groups: { date: string; posts: ScheduledPost[] }[];
  pending: number;
  published: number;
  networks: string[];
  next?: ScheduledPost;
}

export interface GscQuery { query: string; clicks: number; impressions: number }
export interface GscTotals { clicks: number; impressions: number; ctr: number; position: number }

export interface GscAnalysis {
  totals: GscTotals;
  brandedClicks: number;
  nonBrandedClicks: number;
  brandedShare: number;
  opportunities: GscQuery[];
}

export interface GbpSnapshot {
  monthlyViews: number;
  interactions: number;
  newReviews: number;
  rating: number;
  ratingSource: string;
  photosAgeDays: number;
  adsStatus: "active" | "paused" | "unknown";
}

export interface WorkSignals {
  ga4NoData: boolean;
  adsPaused: boolean;
  photosAgeDays: number;
  opportunities: GscQuery[];
  reviewNewCount: number;
  ga4DuplicateProperty?: boolean;
}

export type Severity = "high" | "medium" | "low";
export interface WorkItem { priority: number; title: string; detail: string; severity: Severity }

// ===== fixtures/metricool.ts =====
// Real LRP data captured from Metricool (used for mock-mode + tests).


export const sampleBrands: Brand[] = [
  { id: 5846184, label: "Liberty Roofing Pros", timezone: "America/New_York",
    networksData: { webData: "https://libertyroofingpros.com", facebookData: "793246611010473",
      instagramData: "libertyroofingpros", pinterestData: "libertyroofingpros", tiktokData: "libertyroofingpros",
      gbpData: "locations/10211368737081407898", youtubeData: "UCPdWIJS4s2Fy_I77SgMuG2Q",
      facebookAdsData: "act_239146374077338", googleAdsData: "3742600827" } },
  { id: 5854847, label: "Liberty Roofing Pros - Erie", timezone: "America/New_York",
    networksData: { gbpData: "locations/17102395952234633373" } },
  { id: 5854865, label: "Liberty Roofing Pros - OH", timezone: "America/New_York",
    networksData: { gbpData: "locations/3176851562348906479" } },
  { id: 6272762, label: "Abner Personal", timezone: "America/New_York",
    networksData: { tiktokData: "abnerjmiller" } },
];

export const sampleScheduledPosts: ScheduledPost[] = [
  { id: 1, publicationDate: { dateTime: "2026-06-18T10:00:00", timezone: "America/New_York" },
    text: "What a difference a new roof can make.", providers: [{ network: "facebook", status: "PUBLISHED" }],
    creatorUserMail: "mariel@libertyroofingpros.com" },
  { id: 2, publicationDate: { dateTime: "2026-06-18T14:30:00" },
    text: "From worn out to like new.", providers: [{ network: "tiktok", status: "PUBLISHED" }], tiktokData: {} },
  { id: 3, publicationDate: { dateTime: "2026-06-19T10:05:00" },
    text: "What happens to all the debris?", providers: [{ network: "facebook", status: "PENDING" }],
    facebookData: { type: "POST" }, creatorUserMail: "mariel@libertyroofingpros.com" },
  { id: 4, publicationDate: { dateTime: "2026-06-19T11:33:00" },
    text: "Crane lift behind the scenes.", providers: [{ network: "instagram", status: "PENDING" }],
    instagramData: { type: "REEL" } },
  { id: 5, publicationDate: { dateTime: "2026-06-19T13:00:00" },
    text: "Before-and-after metal roof.", providers: [{ network: "gmb", status: "PENDING" }],
    gmbData: { type: "publication" } },
  { id: 6, publicationDate: { dateTime: "2026-06-20T10:00:00" },
    text: "Peace of mind with a new roof.", providers: [{ network: "instagram", status: "PENDING" }],
    instagramData: { type: "REEL" } },
];

const mk = (dayOfWeek: number, vals: number[]): BestTimeDay => ({
  dayOfWeek,
  bestTimesByHour: vals.map((value, hourOfDay) => ({ hourOfDay, value })),
});

// Instagram best-time scores by hour (0..23), captured from Metricool. Peak = Mon 16:00 (44).
export const sampleBestTimesInstagram: BestTimeDay[] = [
  mk(1, [15, 9, 14, 8, 12, 23, 30, 32, 30, 40, 34, 29, 37, 37, 36, 33, 44, 34, 35, 32, 38, 38, 29, 18]),
  mk(2, [14, 12, 12, 9, 7, 24, 27, 26, 30, 29, 41, 33, 37, 39, 43, 40, 38, 29, 31, 43, 37, 35, 20, 19]),
  mk(3, [13, 8, 8, 12, 15, 15, 32, 29, 38, 31, 30, 43, 34, 28, 35, 28, 35, 31, 33, 30, 32, 31, 21, 17]),
];

// ===== fixtures/seo.ts =====
// Real LRP data captured from Google Search Console + Business Profile (Jun 18, 2026).


export const sampleGscTotals: GscTotals = { clicks: 1100, impressions: 259000, ctr: 0.004, position: 27.6 };

export const sampleGscQueries: GscQuery[] = [
  { query: "liberty roofing pros", clicks: 329, impressions: 1113 },
  { query: "liberty roofing", clicks: 89, impressions: 1572 },
  { query: "liberty roofing pros llc", clicks: 35, impressions: 137 },
  { query: "liberty roofing pros erie pa", clicks: 16, impressions: 96 },
  { query: "roofing companies near me", clicks: 6, impressions: 340 },
  { query: "liberty roofing reviews", clicks: 4, impressions: 54 },
  { query: "liberty roofing pros reviews", clicks: 3, impressions: 174 },
  { query: "liberty roofing company", clicks: 3, impressions: 100 },
  { query: "hadley pa", clicks: 2, impressions: 1109 },
  { query: "roofers near me", clicks: 2, impressions: 299 },
];

export const sampleGbp: GbpSnapshot = {
  monthlyViews: 762, interactions: 1023, newReviews: 2,
  rating: 5.0, ratingSource: "HomeAdvisor", photosAgeDays: 1430, adsStatus: "paused",
};

// GA4 property exists but is not collecting (no tag installed).
export const sampleGa4 = { measurementId: "G-3Q024T4ZCY", collecting: true, users: 0, events: 0 };

// ===== config.ts =====
// Runtime config. Each integration falls back to mock mode (real LRP fixtures)
// when its credentials are absent, so the app runs end-to-end with zero setup.
export const config = {
  metricool: {
    token: process.env.METRICOOL_USER_TOKEN ?? "",
    userId: process.env.METRICOOL_USER_ID ?? "",
    mainBrandId: process.env.METRICOOL_MAIN_BRAND_ID ?? "5846184",
    mock: !process.env.METRICOOL_USER_TOKEN,
  },
  google: {
    accessToken: process.env.GOOGLE_ACCESS_TOKEN ?? "",
    gscProperty: process.env.GSC_PROPERTY ?? "sc-domain:libertyroofingpros.com",
    ga4Property: process.env.GA4_PROPERTY_ID ?? "393784865",
    ga4MeasurementId: process.env.GA4_MEASUREMENT_ID ?? "G-3Q024T4ZCY",
    mock: !process.env.GOOGLE_ACCESS_TOKEN,
  },
  serpbear: {
    url: process.env.SERPBEAR_URL ?? "",
    apiKey: process.env.SERPBEAR_API_KEY ?? "",
    mock: !process.env.SERPBEAR_URL,
  },
};

// ===== transforms.ts =====
// Pure transform functions — the heart of the dashboard logic.
// No I/O, no framework imports; fully unit-tested against real LRP data.



/** Roll Metricool best-time data into a day x hour matrix plus the top slots. */
export function aggregateBestTimes(
  data: BestTimeDay[],
  dayOrder: number[] = [1, 2, 3, 4, 5, 6, 7],
): BestTimeHeatmap {
  const map = new Map<number, Map<number, number>>();
  const cells: HeatCell[] = [];
  let max = 0;
  for (const d of data) {
    const hours = new Map<number, number>();
    for (const h of d.bestTimesByHour) {
      hours.set(h.hourOfDay, h.value);
      if (h.value > max) max = h.value;
      cells.push({ day: d.dayOfWeek, hour: h.hourOfDay, value: h.value });
    }
    map.set(d.dayOfWeek, hours);
  }
  const matrix = dayOrder.map((dn) => {
    const hrs = map.get(dn) ?? new Map<number, number>();
    return Array.from({ length: 24 }, (_, h) => hrs.get(h) ?? 0);
  });
  const topSlots = [...cells].sort((a, b) => b.value - a.value).slice(0, 3);
  return { matrix, max, topSlots, dayOrder };
}

function networksOf(p: ScheduledPost): string[] {
  return (p.providers ?? []).map((x) => x.network).filter(Boolean);
}

export function postStatus(p: ScheduledPost): PostStatus {
  const sts = (p.providers ?? []).map((x) => (x.status ?? "").toUpperCase());
  if (sts.includes("PENDING") || sts.includes("SCHEDULED")) return "pending";
  if (sts.includes("ERROR") || sts.includes("FAILED")) return "error";
  if (sts.length > 0 && sts.every((s) => s === "PUBLISHED")) return "published";
  return sts.includes("PUBLISHED") ? "published" : "pending";
}

/** Group scheduled posts by calendar day and compute headline stats. */
export function groupPostsByDay(posts: ScheduledPost[]): PostsSummary {
  const sorted = [...posts].sort((a, b) =>
    a.publicationDate.dateTime.localeCompare(b.publicationDate.dateTime),
  );
  const groupsMap = new Map<string, ScheduledPost[]>();
  const networks = new Set<string>();
  let pending = 0;
  let published = 0;
  let next: ScheduledPost | undefined;
  for (const p of sorted) {
    const date = p.publicationDate.dateTime.slice(0, 10);
    if (!groupsMap.has(date)) groupsMap.set(date, []);
    groupsMap.get(date)!.push(p);
    networksOf(p).forEach((n) => networks.add(n));
    const st = postStatus(p);
    if (st === "pending") {
      pending++;
      if (!next || p.publicationDate.dateTime < next.publicationDate.dateTime) next = p;
    } else if (st === "published") {
      published++;
    }
  }
  const groups = [...groupsMap.entries()].map(([date, ps]) => ({ date, posts: ps }));
  return { groups, pending, published, networks: [...networks], next };
}

const BRAND_RE = /liberty/i;
// Commercial-intent terms — keeps real roofing searches, drops navigational/geo
// queries like a bare town name (e.g. "hadley pa", which is just the company's location).
const COMMERCIAL_RE = /roof|gutter|siding|repair|replac|contractor|storm|shingle|chimney|inspection|near me/i;

/** Split Search Console queries into branded vs. opportunity and rank opportunities. */
export function analyzeSearchConsole(queries: GscQuery[], totals: GscTotals): GscAnalysis {
  let brandedClicks = 0;
  let nonBrandedClicks = 0;
  for (const q of queries) {
    if (BRAND_RE.test(q.query)) brandedClicks += q.clicks;
    else nonBrandedClicks += q.clicks;
  }
  const totalClicks = brandedClicks + nonBrandedClicks;
  const brandedShare = totalClicks > 0 ? brandedClicks / totalClicks : 0;
  const opportunities = queries
    .filter((q) => !BRAND_RE.test(q.query) && COMMERCIAL_RE.test(q.query))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);
  return { totals, brandedClicks, nonBrandedClicks, brandedShare, opportunities };
}

/** Turn the live signals we detected into a prioritized action list. */
export function buildWhatToWorkOn(s: WorkSignals): WorkItem[] {
  const items: WorkItem[] = [];
  let p = 1;
  if (s.ga4NoData) {
    items.push({ priority: p++, severity: "high", title: "Install the GA4 tag sitewide",
      detail: "GA4 shows 0 users / 0 events — no traffic or conversion data until the tag is installed." });
  }
  if (s.opportunities.length > 0) {
    const top = s.opportunities.slice(0, 3).map((o) => `“${o.query}”`).join(", ");
    items.push({ priority: p++, severity: "high", title: "Win non-branded search",
      detail: `${top} are commercial searches pulling real impressions at low positions — target them with content + on-page SEO to reach page 1.` });
  }
  if (s.adsPaused) {
    items.push({ priority: p++, severity: "medium", title: "Confirm Google Ads status",
      detail: "Two campaigns looked paused in a search preview — verify in Google Ads whether you have active paid coverage." });
  }
  if (s.photosAgeDays > 180) {
    items.push({ priority: p++, severity: "medium", title: "Refresh Google Business photos",
      detail: `Last added ~${s.photosAgeDays} days ago — fresh photos lift local visibility.` });
  }
  if (s.ga4DuplicateProperty) {
    items.push({ priority: p++, severity: "low", title: "Consolidate duplicate GA4 property",
      detail: "A second, empty GA4 property (G-DRR5X6KHNK) exists. Standardize on the one that is collecting (G-3Q024T4ZCY)." });
  }
  items.push({ priority: p++, severity: "low", title: "Keep review velocity up",
    detail: `Ask customers to mention their city in reviews. ${s.reviewNewCount} new review(s) recently.` });
  return items;
}
