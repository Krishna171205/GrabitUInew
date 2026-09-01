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

## Search Console: done on 2026-08-31

Both properties are live under **`hello@unifiednexgrade.com`**, as *Domain*
properties (not URL-prefix), so http/https/www all report together.

| Domain | Property | Verified by | DNS record |
|---|---|---|---|
| letsgrabbit.com | Domain | DNS TXT | `TXT @ google-site-verification=qhWtoIyqgU-wyBbk9R2c-kuSk29puW32Orc9Kgia4Jo` |
| grabit365.com | Domain | DNS TXT | `TXT @ google-site-verification=C2eEKs_vTMqRrG93vgt6P1dZ-2j5AQSS23ytbMzpjSQ` |

**Do not delete either TXT record.** Removing one un-verifies the property and
the history goes with it.

Note the two domains live on **different Hostinger accounts**. `grabit365.com`
is on the account whose API token is in SSM at `/omega/deploy/hostinger_token`
(so it is scriptable); `letsgrabbit.com` is not on that account and has to be
edited through hPanel by hand. `letsgrabbit.com` nameservers are
`horizon/orbit.dns-parking.com`, `grabit365.com` is `atlas/hyperion`.

`https://letsgrabbit.com/sitemap.xml` is submitted. It read "Couldn't fetch"
immediately after submission, which is the pre-crawl state, not an error: the
URL returns 200 `application/xml` to a Googlebot user agent in under 0.3s.

Both properties report "Processing data, check again in a day or so". Search
Console holds history from before a property is verified, so whatever exists
will appear once processing finishes rather than starting from today.

### Still to do

1. **Change of address, grabit365.com to letsgrabbit.com.** Attempted on
   2026-08-31 and **rejected by Google**:

   > Validation failed. 301-redirect from homepage ❌ / Verification for both sites ✅

   Worth being precise about why, because the old domain *looks* fine in a
   browser: `grabit365.com/raydee` shows the "We've moved" screen and then
   lands on `letsgrabbit.com/raydee`, path intact. That hop is client-side
   JavaScript. At the HTTP level the old domain answers `200` with no
   `Location` header, to Googlebot as much as to anyone, so no ranking signal
   moves and the change-of-address check fails on its one required test.

   Re-run it at Settings > Change of address on the `grabit365.com` property
   once the 301 in this PR is deployed. Nothing else about the migration works
   until then.
2. **Create the GTM container** for `letsgrabbit.com`, copy the `GTM-XXXXXXX`
   id into `NEXT_PUBLIC_GTM_ID` in the Jenkinsfile, and deploy.
3. **Create the GA4 property**, then add the GA4 Configuration tag *inside GTM*
   (not in code) on the All Pages trigger, plus a second tag on a Custom Event
   trigger for `page_view` so SPA navigations are counted. Nothing needs to be
   redeployed for GA4 itself, that is the reason for using GTM at all.
4. **Request indexing** for `/`, `/cafes`, `/guides` and both cafe pages once
   this PR is deployed.
5. **Bing Webmaster Tools**, import from Search Console, or verify with
   `NEXT_PUBLIC_BING_SITE_VERIFICATION`. Bing feeds ChatGPT's web results, so
   this is an AEO step, not just a Bing step.
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

## Finding what to write next (once Search Console has data)

The highest-value SEO work is not on this list because it cannot start yet: mine
Search Console for queries Google already shows us for and we have no page about.

1. Search Console, Performance, set the range to **12 months**, Export.
2. Keep `Queries.csv` and `Pages.csv`.
3. `python3 scripts/gsc-gap.py Queries.csv Pages.csv`

It sorts every query by the one thing worth doing about it:

| Action | Means | Fix |
|---|---|---|
| `gap` | We show up for it, no page of ours is about it | Write the page |
| `ctr` | We rank on page one, nobody clicks | Rewrite title and description |
| `rank` | Page two, real demand | Push the page that owns it |
| `cannibalised` | Two of our pages rank for it | Edit the owner, never write a third |

Queries under 100 impressions are dropped: a bad CTR on 12 impressions is noise,
and no edit fixes nobody searching. The opportunity score orders the work, it
does not forecast traffic. Search Console averages position across every query a
page appears for, so the estimate reads high.

`python3 scripts/gsc-gap.py --self-check` runs the logic against fixed numbers.

Verifying the domain is worth doing today rather than later even though the site
is new: Search Console holds up to 16 months of history whether or not the
property was verified at the time, so the export can have real data in it the
moment the property exists. `grabit365.com` is the property with the longer
history, so verify that one too and export it as well.

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
