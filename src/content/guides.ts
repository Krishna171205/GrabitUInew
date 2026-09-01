/**
 * Guide content, as data rather than one page component per article.
 *
 * The site had no non-brand content at all: every indexable page was either the
 * product itself or a legal page, so the only query it could ever win was
 * someone already searching "grabbit". These are the pages that answer the
 * questions people ask *before* they know the brand exists.
 *
 * Written to be quotable: each guide opens with a standalone answer, and every
 * section heading is a question or a claim that can be lifted on its own.
 */

export interface GuideSection {
  heading: string;
  /** Paragraphs. Each one should read correctly if quoted alone. */
  body?: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  /** <h1> and breadcrumb label. */
  title: string;
  /** <title>; may be longer and carry the brand suffix. */
  metaTitle: string;
  description: string;
  /** The TL;DR block. One paragraph, no preamble, safe to cite verbatim. */
  summary: string;
  /** ISO date. Bump when the body materially changes, not for typos. */
  updated: string;
  readingMinutes: number;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
  related?: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'order-coffee-online-delhi',
    title: 'How to order coffee online in Delhi and skip the queue',
    metaTitle: 'How to Order Coffee Online in Delhi (Skip the Queue)',
    description:
      'A practical guide to ordering coffee ahead in Delhi: how pre-order pickup works, what it costs, how it differs from delivery apps, and how to time an order so it is ready when you arrive.',
    summary:
      'To order coffee online in Delhi without waiting, use an order-ahead link from the cafe itself rather than a delivery app: you open the cafe menu in the browser, pick a collection time, pay by UPI or card, and collect at the counter. The coffee is made to your slot instead of after you arrive, so the wait moves from the queue to the walk over.',
    updated: '2026-08-31',
    readingMinutes: 5,
    sections: [
      {
        heading: 'The queue is the actual problem, not the coffee',
        body: [
          'A flat white takes about two minutes to make. In a busy Delhi cafe at 9:30am you will still spend eight to fifteen minutes getting one, because you are queuing to order, queuing to pay, and then queuing again for the barista to reach your ticket.',
          'Delivery apps do not fix that. They move the wait to a rider and add fifteen to forty minutes plus a delivery fee, which is a fine trade at home and a bad one when the cafe is a two-minute walk from your desk or your lecture hall.',
          'Order-ahead fixes it by moving your ticket into the queue before you leave. The cafe starts your drink against the collection time you picked, so the only time you spend on-site is the walk to the counter.',
        ],
      },
      {
        heading: 'How order-ahead pickup actually works',
        body: [
          'The mechanics are the same at every cafe that supports it, whether you reach it through a QR code on the table, a link in the cafe Instagram bio, or a search result.',
        ],
        bullets: [
          'Open the cafe menu in your browser. There is nothing to install for a browser-based platform like Grabbit, and you can look at the full menu without an account.',
          'Build the order: size, milk, sugar, add-ons. Customisations are set once and travel with the ticket, so nothing is lost in translation at a loud counter.',
          'Pick a collection time. This is the part people skip and it is the part that matters: choose the time you will actually arrive, not the earliest possible slot.',
          'Pay online. Prepaid checkout by UPI, card or netbanking is what lets the cafe start the drink before you are physically there.',
          'Collect. You get status updates on WhatsApp as the order moves from confirmed to preparing to ready, so you leave when the cafe is nearly done rather than standing at the counter.',
        ],
      },
      {
        heading: 'Timing an order so it is genuinely ready',
        body: [
          'The single most common mistake is ordering for "now" from ten minutes away, then arriving to a drink that has been sitting on the pass. Espresso goes bitter and foam collapses within a few minutes; a cold brew does not care.',
          'A workable rule for Delhi: add the walk, then add five minutes for anything with steamed milk at peak hours (8:30-10:30am and 4-6pm), and nothing outside them. If you are ordering from a lecture or a meeting that might overrun, push the slot rather than the order.',
          'Ordering hours ahead is fine and is the actual point of the feature. On a platform with no fixed slots you can set a 4pm pickup at 11am and the cafe simply sees it in the right place in its queue.',
        ],
      },
      {
        heading: 'What it costs',
        body: [
          'Pre-order for pickup should cost the same as walking in. There is no rider to pay and no marketplace taking a cut of the menu price, so the number you see is the cafe’s own price.',
          'That is the structural difference from a delivery marketplace. On a delivery app, the menu is frequently marked up to absorb commission, and then a delivery fee, a platform fee and a surge charge are added on top. On order-ahead pickup none of those exist, because none of that work is being done.',
        ],
      },
      {
        heading: 'When you should still use a delivery app',
        body: [
          'Order-ahead is not a replacement for delivery and it is worth being honest about where it loses. If you cannot leave the building, if it is raining, or if you are ordering for six people across three floors, a rider is doing real work and is worth paying for.',
          'Order-ahead wins when the cafe is already on your route: the campus cafe, the one in your office block, the one you pass on the way to the metro. That is a large share of weekday coffee, and it is the share the delivery model serves worst.',
        ],
      },
      {
        heading: 'Where you can do this in Delhi right now',
        body: [
          'Order-ahead in India is still cafe-by-cafe rather than universal. Grabbit is live in Delhi NCR, including cafes on and around the Delhi Technological University campus in Rohini. The current list, with menus and hours, is on the cafes page.',
          'If your regular cafe is not on it, the fastest route is to send them the partner page. Cafes generally adopt order-ahead when a handful of regulars ask for it, because the queue at their counter is their problem too.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do I need an app to order coffee online in Delhi?',
        a: 'Not for a browser-based platform. Grabbit runs at letsgrabbit.com, so a cafe link opens the menu directly and you can order and pay without installing anything. You can add it to your home screen if you want it to behave like an app.',
      },
      {
        q: 'Is ordering ahead more expensive than ordering at the counter?',
        a: 'It should not be. Pickup pre-orders are charged at the cafe’s own menu price because there is no rider and no marketplace commission on the item. Delivery apps are the ones that add markups and fees.',
      },
      {
        q: 'How far in advance can I order?',
        a: 'On Grabbit there are no fixed slots: you can order fifteen minutes ahead or several hours ahead, up to the cafe’s closing time for that day.',
      },
      {
        q: 'What happens if the cafe cannot make my order?',
        a: 'A paid order that a cafe cannot fulfil is refunded to the original payment method. The full policy is on the refunds page.',
      },
    ],
    related: ['order-ahead-vs-delivery-apps', 'cafes-near-dtu'],
  },

  {
    slug: 'cafes-near-dtu',
    title: 'Cafes near DTU: where to order ahead in Rohini',
    metaTitle: 'Cafes Near DTU: Order Ahead in Rohini, Delhi',
    description:
      'Which cafes around Delhi Technological University take pre-orders, how the campus rush actually behaves, and how to time a coffee order between classes.',
    summary:
      'Two cafes at and around Delhi Technological University in Rohini take pre-orders on Grabbit: The Raydee Cafe, near the OAT on campus, and The Hims Cafe nearby. Both let you order from your phone, pay online, and collect at the counter, which is the difference between a ten-minute break and a missed class during the between-lecture rush.',
    updated: '2026-08-31',
    readingMinutes: 4,
    sections: [
      {
        heading: 'The campus rush is short, sharp and predictable',
        body: [
          'A university cafe does not have a steady day. It has four or five spikes that map exactly onto the timetable, and in those ten-minute windows the entire queue arrives at once.',
          'That is the worst possible shape for a counter: the staff are fine for fifty minutes of the hour and underwater for ten. It is also the best possible case for pre-ordering, because the spike is predictable enough that you can put your ticket in before it starts.',
          'Practically: order at the start of the lecture you are sitting in, set collection for a couple of minutes after it ends, and walk past the queue that formed while you were ordering.',
        ],
      },
      {
        heading: 'The Raydee Cafe, near the OAT',
        body: [
          'The Raydee Cafe sits near the Open Air Theatre inside the DTU campus, which makes it the default stop between the academic blocks and the hostels. It is open through the day, and its menu and current hours are on its Grabbit page.',
          'Being on campus is exactly why the queue bites: everyone has the same twenty-minute gap. Ordering ahead from your seat is the whole trick here.',
        ],
      },
      {
        heading: 'The Hims Cafe',
        body: [
          'The Hims Cafe is the second Delhi cafe on Grabbit, opening from the morning through late evening. Its live menu, hours and pickup options are on its Grabbit page.',
          'Hours change with the academic calendar more than they do with the season, so the page is the source of truth rather than a listing on a review site that was last updated two years ago.',
        ],
      },
      {
        heading: 'How to actually use this between classes',
        bullets: [
          'Order during the lecture, not after it. The gap you are trying to beat is the same gap everyone else is walking into.',
          'Set collection for two to three minutes after the bell, not for "now". A drink that waits on the pass is worse than one you waited for.',
          'Pay online. It is what allows the cafe to start the order before you arrive, and it removes the second queue at the till.',
          'Watch the WhatsApp updates rather than the clock. "Ready" means ready; leaving on it is more reliable than guessing.',
          'For a group, put one order in with all the drinks rather than five separate tickets. It is one collection and the cafe can batch the milk.',
        ],
      },
      {
        heading: 'If your cafe is not on the list',
        body: [
          'Coverage around DTU and the wider Rohini area is growing cafe by cafe. If the one you use is not on Grabbit yet, the partner page explains what joining involves for the owner, and cafes tend to take the idea seriously when their own regulars raise it.',
          'The complete, current list is always the cafes page rather than this guide, which is a snapshot.',
        ],
      },
    ],
    faq: [
      {
        q: 'Which cafes near DTU take online pre-orders?',
        a: 'The Raydee Cafe, near the OAT on the DTU campus, and The Hims Cafe both take pre-orders through Grabbit at letsgrabbit.com. Both support paying online and collecting at the counter.',
      },
      {
        q: 'Can I order ahead from DTU without downloading an app?',
        a: 'Yes. Grabbit opens in the browser, so you can open the cafe’s menu, order and pay from a phone with nothing installed.',
      },
      {
        q: 'Is there delivery on campus?',
        a: 'Grabbit is primarily order-ahead for pickup. Some partner cafes arrange their own delivery; where that is offered it appears as an option on the cafe’s page at checkout.',
      },
    ],
    related: ['order-coffee-online-delhi', 'order-ahead-vs-delivery-apps'],
  },

  {
    slug: 'order-ahead-vs-delivery-apps',
    title: 'Order-ahead vs delivery apps: what actually changes',
    metaTitle: 'Order-Ahead vs Delivery Apps (Zomato, Swiggy): The Real Difference',
    description:
      'Pre-order pickup and food delivery look similar and work nothing alike. A clear comparison of cost, speed, food quality and what each model does to the cafe on the other end.',
    summary:
      'Delivery apps are marketplaces: they take a commission from the restaurant, add fees to the customer, and send a rider. Order-ahead is a queue tool: you choose one cafe you were already going to, pay the menu price, and collect it yourself. Delivery wins when you cannot leave; order-ahead wins on speed, on price, and on anything that has to be drunk within five minutes of being made.',
    updated: '2026-08-31',
    readingMinutes: 5,
    sections: [
      {
        heading: 'They solve different problems',
        body: [
          'A delivery app answers "I want food and I am not going anywhere". Discovery matters, the rider matters, and thirty to forty-five minutes is an acceptable answer.',
          'Order-ahead answers "I am going there anyway and I do not want to queue". There is no discovery step, because you have already picked the cafe, and the acceptable wait is measured in the time it takes you to walk over.',
          'Most comparisons go wrong by treating these as competitors for the same order. They are competitors for different halves of the same day.',
        ],
      },
      {
        heading: 'Cost: where the money actually goes',
        bullets: [
          'Delivery: the restaurant pays a commission per order, frequently in the high teens to mid twenties as a percentage. The menu price often rises to absorb it, and you then pay a delivery fee, a platform fee, and sometimes surge on top.',
          'Order-ahead pickup: no rider, no marketplace cut on the item, so the price is the cafe’s counter price. The platform is paid by the cafe as a tool, not as a share of the food.',
          'The practical result for a two-hundred-rupee coffee run is a difference of fifty to eighty rupees, most of which buys you a longer wait.',
        ],
      },
      {
        heading: 'Speed and food quality',
        body: [
          'Espresso-based drinks are the clearest case. Microfoam collapses and crema goes flat within a few minutes, so a cappuccino that spends twenty-five minutes in a bag is a different drink from the one the barista made.',
          'Order-ahead has the opposite failure mode, and it is worth knowing: if you set a collection time and arrive late, your drink also sits. The fix is choosing a realistic slot rather than the earliest one, which is entirely under your control and is not true of a rider stuck in traffic.',
          'For anything cold, fried or wrapped, delivery holds up far better, and the argument for pickup is mostly the price and the ten minutes.',
        ],
      },
      {
        heading: 'What each model does to the cafe',
        body: [
          'This part is invisible to the customer and drives which cafes offer what. A delivery marketplace brings volume the cafe did not have, but it takes a commission, owns the customer relationship, and gives the cafe no control over how its food travels.',
          'Order-ahead brings no new discovery at all. What it changes is throughput: the same staff serve more people in the same peak because tickets arrive spread out instead of as a wall of ten people at 9:30, and the customer stays the cafe’s own.',
          'That is why a lot of independent cafes run both. Delivery is a distribution channel; order-ahead is an operations fix.',
        ],
      },
      {
        heading: 'A short decision rule',
        bullets: [
          'You are staying put and it is more than a ten-minute walk: delivery.',
          'You will pass the cafe in the next hour: order ahead.',
          'The order is mostly hot coffee: order ahead, and pick a realistic collection time.',
          'It is a group order at a fixed time, like a meeting: order ahead, one ticket, collection set to the start of the break.',
          'You do not know which cafe you want: a delivery app is a better browser. Order-ahead assumes you have already chosen.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is Grabbit a delivery app like Zomato or Swiggy?',
        a: 'No. Grabbit is an order-ahead platform for pickup: you choose one cafe, pay online, and collect at the counter. Some partner cafes arrange their own delivery, but there is no marketplace of riders and no commission taken on the menu price.',
      },
      {
        q: 'Why is order-ahead cheaper than delivery?',
        a: 'Because two costs disappear. There is no rider to pay, and there is no marketplace commission on the item that the cafe has to price back in. You pay the cafe’s counter price.',
      },
      {
        q: 'Can I use both?',
        a: 'Most people do. Delivery is for when you cannot leave; order-ahead is for the cafe you already walk past on the way in.',
      },
    ],
    related: ['order-coffee-online-delhi', 'order-ahead-system-for-cafes'],
  },

  {
    slug: 'order-ahead-system-for-cafes',
    title: 'Setting up order-ahead at your cafe: what it takes',
    metaTitle: 'Order-Ahead System for Cafes in India: Setup, Cost, Operations',
    description:
      'For cafe owners: what an order-ahead system changes at the counter, what it needs from your staff and menu, how payouts and refunds work, and what to watch in the first month.',
    summary:
      'Adding order-ahead to a cafe is an operations change more than a technology one. The software takes an hour to set up: your menu, your hours, and a device at the counter. The work is deciding who watches the incoming tickets during a rush and how far ahead you are willing to accept orders. Done properly it raises throughput at peak without adding staff, and unlike a delivery marketplace it does not take a share of your menu price.',
    updated: '2026-08-31',
    readingMinutes: 6,
    sections: [
      {
        heading: 'What problem this is actually solving',
        body: [
          'Most independent cafes are not short of demand across the day. They are short of counter capacity for about ninety minutes of it, and that is where the walkouts happen: a customer sees six people in line, does the arithmetic, and goes somewhere else.',
          'Order-ahead recovers those. A pre-order arrives as a ticket with a collection time attached, so the peak flattens: the same two staff produce the same number of drinks with the queue spread across the twenty minutes before the rush instead of during it.',
          'It also removes the slowest part of a counter transaction, which is not making the drink. It is taking the order, repeating the customisation, and settling payment.',
        ],
      },
      {
        heading: 'What you need before switching it on',
        bullets: [
          'A current menu with real prices, including sizes and add-ons. Order-ahead exposes every inconsistency in a menu that staff have been quietly patching in person.',
          'Honest opening hours per day of the week, including the days you close early. Customers pre-order against these.',
          'One device that someone is responsible for during a rush. A tablet by the pass works; a phone in an apron pocket does not.',
          'A bank account for payouts and the usual business KYC. Prepaid orders settle to you rather than being collected at the till.',
          'A decision on how far ahead you will accept orders. Same-day only is the simplest starting point.',
        ],
      },
      {
        heading: 'The operational change is small but real',
        body: [
          'The failure mode of every order-ahead rollout is the same: nobody owns the screen. Tickets arrive, nobody sees them for four minutes, and a customer turns up to an order that has not been started. That converts a good experience into a worse one than queuing.',
          'The fix is a rule, not a feature: during peak hours one person checks the screen every time they finish a drink. Outside peak, the notification is enough.',
          'The second change is prep sequencing. A pre-order with a 9:40 collection should not be made at 9:20 just because it arrived then. Staff need to work to the collection time, which is a habit that takes about a week.',
        ],
      },
      {
        heading: 'Money: payouts, refunds and what it costs you',
        body: [
          'Pre-orders on Grabbit are prepaid: the customer pays by UPI, card or netbanking at checkout and the money settles to your account on a payout cycle rather than landing in the till.',
          'Refunds are the case worth thinking about in advance. If you run out of something after an order is paid for, that order is refunded to the customer’s original payment method. In practice this is rare and is mostly avoided by keeping the menu’s availability toggles current during the day.',
          'The commercial model matters more than any feature: order-ahead for pickup does not take a percentage of your menu price the way a delivery marketplace does, so you are not repricing the menu to absorb a commission, and the customer remains yours.',
        ],
      },
      {
        heading: 'What to watch in the first month',
        bullets: [
          'Time from ticket arriving to ticket acknowledged during peak. If this drifts past a couple of minutes, the screen has no owner.',
          'Share of orders collected within five minutes of their slot. Low numbers usually mean customers are picking the earliest time rather than a realistic one, which is fixable with a line of copy at checkout.',
          'Items disabled during service. If nothing is ever toggled off, your availability is not being maintained and refunds will follow.',
          'Repeat rate per customer, not order volume. Order-ahead does not create discovery. It converts existing regulars into more frequent regulars, and that is the number that should move.',
        ],
      },
      {
        heading: 'Getting started',
        body: [
          'Setup for a single cafe is measured in hours, not weeks: the menu, the hours, the payout details, and a device at the counter. The partner page covers what Grabbit provides on the cafe side, including the staff console for menu, orders, slots and payouts.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does an order-ahead platform take a commission on my menu price?',
        a: 'Grabbit is a pre-order and pickup platform rather than a delivery marketplace, so it does not take a per-order cut of your menu price. Cafes set and keep their own pricing. Partnership terms are on the partner page.',
      },
      {
        q: 'How long does it take to set up?',
        a: 'The setup itself is short: loading the menu, setting per-day hours, and adding payout details. The part that takes a week is the counter habit of working to collection times rather than to arrival order.',
      },
      {
        q: 'What happens if we run out of an item after someone has paid?',
        a: 'The order is refunded to the customer’s original payment method. Keeping availability toggles current during service is what keeps this rare.',
      },
      {
        q: 'Do we need new hardware?',
        a: 'No. The staff console runs in a browser, so an existing tablet or laptop at the counter is enough, as long as one person is responsible for watching it during a rush.',
      },
    ],
    related: ['order-ahead-vs-delivery-apps', 'order-coffee-online-delhi'],
  },
];

export const guideBySlug = (slug: string): Guide | undefined => GUIDES.find((g) => g.slug === slug);
