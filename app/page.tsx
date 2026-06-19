import { getDashboard, postStatus } from "../lib/app.js";
import type { ScheduledPost } from "../lib/app.js";

export const dynamic = "force-dynamic";

const NET: Record<string, { l: string; c: string }> = {
  facebook: { l: "Facebook", c: "#1877F2" },
  instagram: { l: "Instagram", c: "#E4405F" },
  tiktok: { l: "TikTok", c: "#111827" },
  youtube: { l: "YouTube", c: "#FF0000" },
  pinterest: { l: "Pinterest", c: "#BD081C" },
  gmb: { l: "Google Business", c: "#4285F4" },
  twitter: { l: "X", c: "#111827" },
  linkedin: { l: "LinkedIn", c: "#0A66C2" },
};
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function fmtTime(dt: string): string {
  const hm = dt.slice(11, 16);
  const [hStr, m] = hm.split(":");
  let h = Number(hStr);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
function fmtDate(ymd: string): string {
  const [y, mo, d] = ymd.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function postType(p: ScheduledPost): string {
  const t = (p.instagramData?.type || p.facebookData?.type || p.youtubeData?.type || p.gmbData?.type || "").toUpperCase();
  if (t === "PUBLICATION") return "GBP";
  if (t === "POST" || t === "") return "";
  return t;
}
function fmtK(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : String(n);
}

export default async function Page() {
  const d = await getDashboard();
  return (
    <main className="wrap">
      <header className="h">
        <div className="logo">LRP</div>
        <div>
          <h1>Marketing Command Center</h1>
          <div className="sub">Liberty Roofing Pros &middot; live marketing + SEO</div>
        </div>
      </header>

      <div className="stats" style={{ marginTop: 14 }}>
        <div className="stat"><div className="n">{d.schedule.pending}</div><div className="l">Upcoming posts</div></div>
        <div className="stat"><div className="n">{d.schedule.networks.length}</div><div className="l">Active networks</div></div>
        <div className="stat"><div className="n">{fmtK(d.seo.totals.clicks)}</div><div className="l">Search clicks 90d</div></div>
        <div className="stat"><div className="n">{d.seo.totals.position.toFixed(1)}</div><div className="l">Avg position</div></div>
      </div>

      <h2>Accounts</h2>
      <div className="brands">
        {d.brands.map((b) => (
          <div className="brand" key={b.id}>
            <div className="bt"><span className="dot" />{b.label}</div>
            <div className="nets">
              {Object.keys(b.networksData ?? {}).map((k) => (
                <span className="chip" key={k}>{k.replace("Data", "")}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2>This week&rsquo;s posts</h2>
      <div>
        {d.schedule.groups.map((g) => (
          <div className="daygrp" key={g.date}>
            <div className="dayhdr">{fmtDate(g.date)} <span className="cnt">&middot; {g.posts.length} post(s)</span></div>
            {g.posts.map((p) => {
              const st = postStatus(p);
              const ty = postType(p);
              return (
                <div className="post" key={String(p.id)}>
                  <div className="tm">{fmtTime(p.publicationDate.dateTime)}</div>
                  <div className="body">
                    <div className="meta">
                      {(p.providers ?? []).map((pr, i) => {
                        const info = NET[pr.network] ?? { l: pr.network, c: "#64748b" };
                        return <span className="nb" key={i} style={{ background: info.c }}>{info.l}</span>;
                      })}
                      {ty ? <span className="tag">{ty}</span> : null}
                      <span className={`st ${st}`}>{st}</span>
                    </div>
                    <div className="snip">{(p.text ?? "").slice(0, 120)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <h2>Best time to post &middot; Instagram</h2>
      <div className="card pad heat">
        <table className="hm">
          <tbody>
            {d.heatmap.matrix.map((row, ri) => (
              <tr key={ri}>
                <th className="rh">{DAYS[ri]}</th>
                {row.map((v, hi) => {
                  const a = d.heatmap.max ? 0.08 + 0.85 * (v / d.heatmap.max) : 0;
                  return <td key={hi} className="cell" style={{ background: `rgba(15,81,50,${a.toFixed(2)})` }} title={`${DAYS[ri]} ${hi}:00 - ${v}`} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>SEO &middot; Search Console</h2>
      <div className="stats">
        <div className="stat"><div className="n">{fmtK(d.seo.totals.clicks)}</div><div className="l">Clicks 90d</div></div>
        <div className="stat"><div className="n">{fmtK(d.seo.totals.impressions)}</div><div className="l">Impressions 90d</div></div>
        <div className="stat"><div className="n">{(d.seo.totals.ctr * 100).toFixed(1)}%</div><div className="l">Avg CTR</div></div>
        <div className="stat"><div className="n">{Math.round(d.seo.brandedShare * 100)}%</div><div className="l">Branded clicks</div></div>
      </div>
      <div className="card pad" style={{ marginTop: 12 }}>
        <strong>Opportunity keywords (non-branded):</strong>
        <ul>
          {d.seo.opportunities.map((o) => (
            <li key={o.query}>{o.query} &mdash; {o.impressions} impressions, {o.clicks} clicks</li>
          ))}
        </ul>
      </div>

      <div className="card pad" style={{ marginTop: 12, borderLeft: d.ga4.collecting ? "4px solid #15803d" : "4px solid #b42318" }}>
        {d.ga4.collecting ? (
          <span><strong>GA4 is collecting</strong> under property {d.ga4.measurementId} (via Tag Manager). A duplicate empty property (G-DRR5X6KHNK) can be consolidated.</span>
        ) : (
          <span><strong>GA4 isn&rsquo;t collecting.</strong> Property {d.ga4.measurementId} shows 0 users / 0 events &mdash; see docs/ga4-install.md.</span>
        )}
      </div>

      <h2>Reviews &amp; local</h2>
      <div className="stats">
        <div className="stat"><div className="n">{d.gbp.monthlyViews}</div><div className="l">Monthly views</div></div>
        <div className="stat"><div className="n">{d.gbp.interactions}</div><div className="l">Interactions</div></div>
        <div className="stat"><div className="n">{d.gbp.newReviews}</div><div className="l">New reviews</div></div>
        <div className="stat"><div className="n">{d.gbp.rating.toFixed(1)}&#9733;</div><div className="l">Rating ({d.gbp.ratingSource})</div></div>
      </div>

      <h2>What to work on</h2>
      <div className="card pad">
        <ol className="work">
          {d.work.map((w) => (
            <li key={w.priority}><span className={`sev ${w.severity}`}>{w.severity}</span> <strong>{w.title}</strong> &mdash; {w.detail}</li>
          ))}
        </ol>
      </div>

      <footer>LRP Marketing Hub &middot; live data in production, real sample data in mock mode.</footer>
    </main>
  );
}
