#!/usr/bin/env python3
"""Rank Search Console queries by what is actually worth doing about them.

Feed it the CSVs from Search Console (Performance, set the range to 12 months,
Export, "Queries" and "Pages" sheets). It answers three questions per query and
keeps the biggest answer, because a query can only be worked on one way:

  gap    We show up for it and have no page about it.  -> write a page
  ctr    We rank on page one and nobody clicks.        -> rewrite title/description
  rank   We sit on page two with real demand.          -> push the existing page

Deliberately boring: stdlib only, no network, no state. Run it, read the table,
go write the thing at the top.

    python3 scripts/gsc-gap.py Queries.csv Pages.csv
    python3 scripts/gsc-gap.py --self-check

Two things it will not do, on purpose:

  * It will not tell you a query is worth writing about when nobody searches it.
    Below MIN_IMPRESSIONS a bad CTR means nothing and no edit can fix it.
  * It will not suggest a new page for a query one of our pages already ranks
    for. Writing a second one splits our own ranking. Those come out flagged as
    cannibalisation, to be fixed by editing the page that already owns it.

The opportunity numbers are a sort order, not a forecast. Search Console blends
average position across every query a page appears for, so the CTR estimate runs
high. It is good for deciding what to do first and bad for promising anyone a
number.
"""

from __future__ import annotations

import csv
import re
import sys
from dataclasses import dataclass

# Below this, the query has no audience and the percentages are noise.
MIN_IMPRESSIONS = 100

# Roughly what share of clicks a position earns. Public aggregate curves differ
# by a few points and by vertical; the ordering they produce is what matters
# here, not the third decimal.
CTR_CURVE = {
    1: 0.270, 2: 0.155, 3: 0.100, 4: 0.070, 5: 0.053,
    6: 0.041, 7: 0.032, 8: 0.026, 9: 0.022, 10: 0.019,
}
PAGE_TWO_CTR = 0.004  # anything past 10 gets approximately nothing

# Words that carry no topical signal when matching a query to a page slug.
STOPWORDS = {
    'a', 'an', 'and', 'are', 'at', 'be', 'best', 'can', 'do', 'does', 'for',
    'from', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'near', 'of', 'on', 'or',
    'the', 'to', 'top', 'what', 'when', 'where', 'which', 'who', 'why', 'with',
    'you', 'your',
}


def expected_ctr(position: float) -> float:
    return CTR_CURVE.get(int(round(position)), PAGE_TWO_CTR)


def tokens(text: str) -> set[str]:
    return {w for w in re.split(r'[^a-z0-9]+', text.lower()) if w and w not in STOPWORDS}


@dataclass
class Row:
    term: str
    clicks: int
    impressions: int
    position: float

    @property
    def ctr(self) -> float:
        return self.clicks / self.impressions if self.impressions else 0.0


@dataclass
class Finding:
    query: str
    action: str
    opportunity: int
    impressions: int
    position: float
    ctr: float
    note: str


def read_csv(path: str) -> list[Row]:
    """Search Console exports name the first column after the sheet ("Top
    queries", "Top pages", or a localised equivalent), so it is read by position
    rather than by name. The rest are matched loosely because the header casing
    has changed between exports before."""
    rows: list[Row] = []
    with open(path, newline='', encoding='utf-8-sig') as handle:
        reader = csv.reader(handle)
        header = next(reader, None)
        if not header:
            return rows
        lowered = [h.strip().lower() for h in header]

        def col(*names: str) -> int | None:
            for i, h in enumerate(lowered):
                if any(n in h for n in names):
                    return i
            return None

        i_clicks = col('click')
        i_impr = col('impression')
        i_pos = col('position')
        if i_clicks is None or i_impr is None or i_pos is None:
            raise SystemExit(f'{path}: expected clicks/impressions/position columns, got {header}')

        for raw in reader:
            if not raw or not raw[0].strip():
                continue
            try:
                rows.append(Row(
                    term=raw[0].strip(),
                    clicks=int(float(raw[i_clicks] or 0)),
                    impressions=int(float(raw[i_impr] or 0)),
                    # Exports sometimes carry a stray % on CTR; position is plain.
                    position=float(raw[i_pos] or 0),
                ))
            except ValueError:
                continue
    return rows


def covered_by(query: str, pages: list[Row]) -> list[str]:
    """Pages whose URL already reads as being about this query.

    Slug matching, not semantics: it is trying to catch "we already wrote this",
    and a URL that shares most of the query's meaningful words is that. It will
    miss a page whose slug says nothing about its subject, which is a reason to
    name pages after what they are about.
    """
    want = tokens(query)
    if not want:
        return []
    hits = []
    for page in pages:
        slug = page.term.split('?')[0].rstrip('/').rsplit('/', 1)[-1]
        have = tokens(slug.replace('-', ' '))
        if have and len(want & have) >= max(2, len(want) - 1):
            hits.append(page.term)
    return hits


def analyse(queries: list[Row], pages: list[Row]) -> tuple[list[Finding], list[Finding]]:
    findings: list[Finding] = []
    cannibalised: list[Finding] = []

    for q in queries:
        if q.impressions < MIN_IMPRESSIONS:
            continue

        owners = covered_by(q.term, pages)

        # Clicks we are not getting at the position we already hold.
        ctr_gap = max(0.0, expected_ctr(q.position) - q.ctr) * q.impressions
        # Clicks a page-two result would gain by reaching page one.
        rank_gain = (expected_ctr(8) - PAGE_TWO_CTR) * q.impressions if q.position > 10 else 0.0

        if len(owners) > 1:
            cannibalised.append(Finding(
                q.term, 'cannibalised', int(max(ctr_gap, rank_gain)), q.impressions,
                q.position, q.ctr,
                f'{len(owners)} of our pages rank for this: {", ".join(owners[:3])}. '
                'Pick the one that should own it and edit that, do not write another.',
            ))
            continue

        if not owners:
            # Google already shows us for it and we never wrote the page. This is
            # the cheapest traffic on the list.
            findings.append(Finding(
                q.term, 'gap', int(max(ctr_gap, rank_gain, q.impressions * expected_ctr(8))),
                q.impressions, q.position, q.ctr,
                'No page of ours is about this. Write one.',
            ))
        elif rank_gain >= ctr_gap:
            findings.append(Finding(
                q.term, 'rank', int(rank_gain), q.impressions, q.position, q.ctr,
                f'Page two with real demand. Push {owners[0]}.',
            ))
        else:
            findings.append(Finding(
                q.term, 'ctr', int(ctr_gap), q.impressions, q.position, q.ctr,
                f'Ranking without clicking. Rewrite the title and description on {owners[0]}.',
            ))

    findings.sort(key=lambda f: -f.opportunity)
    cannibalised.sort(key=lambda f: -f.opportunity)
    return findings, cannibalised


def report(findings: list[Finding], cannibalised: list[Finding], limit: int = 30) -> None:
    if not findings and not cannibalised:
        print(f'Nothing above {MIN_IMPRESSIONS} impressions. Too early: get the pages indexed first.')
        return

    print(f'{"OPP":>6}  {"ACTION":<6} {"IMPR":>7} {"POS":>5} {"CTR":>6}  QUERY')
    print('-' * 92)
    for f in findings[:limit]:
        print(f'{f.opportunity:>6}  {f.action:<6} {f.impressions:>7} {f.position:>5.1f} {f.ctr:>5.1%}  {f.query}')

    if len(findings) > limit:
        print(f'\n... {len(findings) - limit} more below the top {limit}.')

    print('\nWhat to do, in order:')
    for f in findings[:8]:
        print(f'  [{f.action}] {f.query}\n        {f.note}')

    if cannibalised:
        print('\nCannibalisation, fix before writing anything new:')
        for f in cannibalised[:8]:
            print(f'  {f.query}\n        {f.note}')

    print('\nOPP is an ordering signal, not a forecast: Search Console averages '
          'position across every query a page shows for, so it reads high.')


def self_check() -> None:
    pages = [Row('https://letsgrabbit.com/guides/cafes-near-dtu', 10, 400, 8.0),
             Row('https://letsgrabbit.com/cafes', 5, 200, 9.0)]

    # Shown 5,000 times at position 7, no page about it: the gap case.
    gap = Row('order coffee online gurgaon', 4, 5000, 7.0)
    # Page one, a page owns it, almost nobody clicks: the CTR case.
    ctr = Row('cafes near dtu', 12, 4000, 4.0)
    # Page two with demand: the rank case.
    rank = Row('cafes near dtu delhi', 3, 3000, 14.0)
    # Nobody searches it, so no percentage about it means anything.
    quiet = Row('grabbit letsgrabbit order ahead thing', 0, 12, 30.0)

    findings, cannibalised = analyse([gap, ctr, rank, quiet], pages)
    by_query = {f.query: f for f in findings}

    assert quiet.term not in by_query, 'low-impression queries must be dropped'
    assert by_query[gap.term].action == 'gap'
    assert by_query[ctr.term].action == 'ctr'
    assert by_query[rank.term].action == 'rank'
    # Ordering is by opportunity, and a page-one result nobody clicks beats
    # an unwritten page: 4,000 impressions at position 4 with 0.3% CTR leaves
    # more clicks on the table than 5,000 at position 7 ever could. That is the
    # whole reason the CTR lever exists, so it is worth pinning down.
    assert [f.opportunity for f in findings] == sorted((f.opportunity for f in findings), reverse=True)
    assert findings[0].query == ctr.term, findings[0].query
    assert by_query[gap.term].opportunity > by_query[rank.term].opportunity
    assert not cannibalised

    # Two pages matching one query is the cannibalisation branch, not a gap.
    twin = [Row('https://letsgrabbit.com/guides/cafes-near-dtu', 1, 10, 9.0),
            Row('https://letsgrabbit.com/cafes-near-dtu', 1, 10, 9.0)]
    _, clashes = analyse([Row('cafes near dtu', 5, 900, 9.0)], twin)
    assert len(clashes) == 1, clashes

    # An empty export is a normal state for a site that is not indexed yet.
    assert analyse([], []) == ([], [])

    print('self-check ok')


if __name__ == '__main__':
    args = sys.argv[1:]
    if args == ['--self-check']:
        self_check()
    elif len(args) == 2:
        report(*analyse(read_csv(args[0]), read_csv(args[1])))
    else:
        raise SystemExit(__doc__)
