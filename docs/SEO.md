# SEO / AEO for letsgrabbit.com

What is wired into the codebase, what still needs a human with an account, and
how to tell whether any of it worked.

## What ships from this repo

| Concern | Where | Note |
|---|---|---|
| Canonical host | `src/lib/seo.ts` → `SITE_URL` | `letsgrabbit.com`. `www` already 301s at nginx. |
| Old domain | `src/middleware.ts` | `grabit365.com/*` → **301** → `letsgrabbit.com/*`, path and query preserved. Was a 200 rewrite, which stranded every old link's ranking signal and dropped the path. |
| robots.txt | `src/app/robots.ts` | Generated from `NOINDEX_ROUTES`, so it cannot drift from the metadata. No `Crawl-delay` (Bing honoured the old 10s and crawled slower for it). AI crawlers allowed explicitly. |
| Sitemap | `src/app/sitemap.ts` | Static routes + one entry per live cafe (from the cafes API) + one per guide. Daily revalidate. |
| Social preview | `src/app/opengraph-image.tsx` | Real PNG via `next/og`. The old `og-image.svg` rendered as *no image* on WhatsApp, X, LinkedIn, Slack and iMessage, every share of the site was previewing blank. |
| Cafe pages | `src/app/[slug]/(customer)/page.tsx` | `generateMetadata` + `Restaurant` JSON-LD with geo, hours and an `OrderAction`. Without their own metadata these inherited the root canonical and pointed every cafe at the homepage, so none of them could be indexed. |
| Cafe list | `src/app/cafes/page.tsx` | `ItemList` expanding each cafe to its full `Restaurant` node. |
| Guides | `src/content/guides.ts`, `src/app/guides/**` | Four prerendered guides, the only non-brand content on the site. `Article` + `FAQPage` + `BreadcrumbList` per page. |
| Entity graph | `src/lib/seo.ts` | `Organization` / `WebSite` with stable `@id`s that everything else references. |
| AI answer engines | `public/llms.txt` | Facts an engine should get right, plus the canonical page list. |
| Analytics | `src/components/Analytics.tsx` | GTM container + a `page_view` dataLayer push on every client-side route change (the app is an SPA; GTM's own pageview fires once). Renders nothing when `NEXT_PUBLIC_GTM_ID` is unset. |
| CSP | `next.config.ts` | `googletagmanager` / `google-analytics` allowed in `script-src`, `connect-src`, `frame-src`. Without this GTM is silently blocked and the only trace is a `securitypolicyviolation`. |

### Environment

Set in `Jenkinsfile` (they are `NEXT_PUBLIC_*`, so they are inlined at **build**
time, setting them only in `deploy.sh` ships the literal variable name):

```
NEXT_PUBLIC_GTM_ID                       # GTM-XXXXXXX. Empty = no tag rendered.
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION     # Search Console meta-tag token
NEXT_PUBLIC_BING_SITE_VERIFICATION       # Bing Webmaster msvalidate.01 token
```

All three are currently empty. The site builds and runs fine that way; it just
has no analytics and no verified console.

## Account work (needs the Google/Bing account, cannot be done from the repo)

1. **Create the GTM container** for `letsgrabbit.com`, copy the `GTM-XXXXXXX`
   id into `NEXT_PUBLIC_GTM_ID` in the Jenkinsfile, and deploy.
2. **Create the GA4 property**, then add the GA4 Configuration tag *inside GTM*
   (not in code) on the All Pages trigger, plus a second tag on a Custom Event
   trigger for `page_view` so SPA navigations are counted. Nothing needs to be
   redeployed for GA4 itself, that is the reason for using GTM at all.
3. **Google Search Console**, add `letsgrabbit.com` as a *Domain* property
   (DNS TXT at Hostinger) rather than a URL-prefix property, so http/https and
   www all report together. Then:
   - submit `https://letsgrabbit.com/sitemap.xml`
   - add `grabit365.com` as its own property and use **Change of Address** to
     point it at `letsgrabbit.com`; the 301 alone is not the whole migration
   - request indexing for `/`, `/cafes`, `/guides` and both cafe pages
4. **Bing Webmaster Tools**, import from Search Console (one click), or verify
   with `NEXT_PUBLIC_BING_SITE_VERIFICATION`. Bing feeds ChatGPT's web results,
   so this is an AEO step, not just a Bing step.
5. **Google Business Profile** for each partner cafe is the cafe's own listing,
   not ours, but ask each partner to add the Grabbit cafe URL as their
   "Order ahead" / "Menu" link. That is both a real backlink from a high-trust
   domain and the thing that puts the cafe page into local results.

## Backlinks

Ranked by effort-to-value. Nothing here is bought, and nothing is a link farm,
a Delhi cafe startup gets caught by a link scheme faster than it gets ranked by
one.

**Do first (we control both ends):**
- `unifiednexgrade.com`, link Grabbit from the product list with the anchor
  "Grabbit, cafe order-ahead in Delhi", not "click here".
- `gradient365.com` and `posomega.com`, same, from their footers.
- Partner cafes' own Instagram bio / Linktree / website menu link.
- The GitHub org profile and any public repo README that mentions the product.

**Then (free, real, India-relevant):**
- Google Business Profile of each partner cafe (see above).
- Product directories that actually get crawled: Product Hunt, BetaList,
  AlternativeTo, SaaSHub, Crunchbase, IndiaMART is not worth it for this.
- India startup listings: YourStory Startup Directory, Inc42 directory,
  StartupIndia (Government of India registration, also useful for other reasons).
- DTU student/campus pages and society Instagram accounts, small domains, but
  they are topically and geographically exactly on target, which is what the
  cafes-near-DTU guide is for.
- Reddit r/delhi, r/india, r/DTU threads *answering an actual question*. A
  dropped link with no answer gets removed and does nothing.

**Do not:** buy guest posts, submit to 200 generic directories, or run any
"1000 backlinks" service. Those are the exact patterns the spam systems match.

## Measuring whether it worked

The trap is reading a 30% lift as "our change worked" when the whole site
happened to move. Every reading needs its site-wide control.

- Baseline the day GSC is verified: impressions, clicks, average position,
  and indexed-page count. Nothing before this is measurable.
- Re-read at **+28 days** and **+56 days**, and record the site-wide numbers for
  the *same* dates alongside whatever page you are judging.
- Watch, in order of what actually matters here:
  1. indexed pages (currently the binding constraint, cafe pages could not be
     indexed at all before this change)
  2. impressions on non-brand queries (the guides' entire job)
  3. clicks on brand queries `grabbit` / `lets grabbit` / `letsgrabbit`
  4. average position
- CTR is the cheapest lever once pages rank: a page sitting at position 6-13
  with a poor CTR needs a title and description rewrite, not more content.
- For AEO there is no console. Check monthly by asking ChatGPT, Claude,
  Perplexity and Google AI Overviews a question the guides answer (e.g. "how do
  I order coffee ahead in Delhi", "cafes near DTU that take pre-orders") and
  record whether Grabbit is named and linked.

## Known gaps

- `Organization.sameAs` is empty. The previous values (`instagram.com/grabbit`,
  `twitter.com/grabbit`, `linkedin.com/company/grabbit`) were never confirmed as
  ours; pointing `sameAs` at a same-named profile belonging to someone else
  tells Google that *is* the Grabbit entity, which is worse than saying nothing.
  Fill `SOCIAL_PROFILES` in `src/lib/seo.ts` once the real handles are known.
  The `twitter:site` / `twitter:creator` meta tags still say `@grabbit` for the
  same unconfirmed reason.
- Core Web Vitals have not been measured on the current build. The landing page
  carries three.js, GSAP, Lenis and two videos, which is where to look first if
  mobile LCP is poor.
- No review or rating schema, because there are no reviews yet. Do not invent
  them; fake `AggregateRating` is a manual-action risk.
