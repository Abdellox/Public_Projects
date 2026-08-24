import type { Lesson } from "./types";

export const lessons: Lesson[] = [
  {
    number: 1,
    slug: "what-is-a-company",
    title: "What is a company?",
    description:
      "The starting point: what a company actually is, what it is made of, and why organizations exist at all.",
    readingTime: 5,
    level: "Beginner",
    sections: [
      {
        id: "definition",
        heading: "A simple definition",
        paragraphs: [
          "A company is a group of people working together toward a shared goal — usually to create something valuable that other people will pay for.",
          "That's really it. Everything else — org charts, departments, KPIs, meetings — exists to help a group of people coordinate at scale. A three-person coffee shop and a 200,000-person corporation are, at their core, the same thing: people organized to deliver value.",
        ],
      },
      {
        id: "why-companies-exist",
        heading: "Why companies exist",
        paragraphs: [
          "In theory, individuals could do everything alone. In practice, one person cannot build a car, run global logistics, negotiate supplier contracts, and sell to millions of customers. Companies exist because organized groups can achieve things individuals cannot:",
        ],
        bullets: [
          "Specialization — each person focuses on what they do best",
          "Coordination — work is structured so thousands of efforts add up to one outcome",
          "Capital — companies pool money to buy equipment, tools, and talent no individual could afford",
          "Persistence — a company outlives any single employee; knowledge accumulates over decades",
        ],
      },
      {
        id: "anatomy",
        heading: "What every company has",
        paragraphs: [
          "Regardless of size or industry, almost every company shares the same basic anatomy. Learn these five elements and you have a mental model for nearly any organization you will ever join:",
        ],
        bullets: [
          "People — organized into teams, departments, and reporting lines",
          "A product or service — the thing customers pay for",
          "Customers — the people or businesses who pay, and why the company exists",
          "Money — revenue coming in, costs going out, and someone tracking both",
          "Decisions — someone, somewhere, decides what happens next",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "A company is people organized to create value others pay for",
          "All structures — departments, hierarchy, processes — are coordination tools",
          "Every company needs: people, a product, customers, money, and decisions",
        ],
      },
    ],
  },
  {
    number: 2,
    slug: "how-companies-make-money",
    title: "How companies make money",
    description:
      "Revenue, costs, and profit — the engine behind every business, explained without jargon.",
    readingTime: 6,
    level: "Beginner",
    sections: [
      {
        id: "the-engine",
        heading: "The basic engine",
        paragraphs: [
          "Every company runs on one simple equation: bring in more money than you spend. Money comes in from customers (revenue). Money goes out for salaries, rent, software, materials (costs). Whatever remains is profit.",
          "Companies that consistently earn more than they spend can grow, hire, and survive downturns. Companies that don't eventually run out of cash. This single fact drives almost everything that happens inside an organization.",
        ],
      },
      {
        id: "where-money-comes-from",
        heading: "Where money comes from",
        paragraphs: [
          "Revenue models vary enormously, but they all answer the same question: who pays, for what, how often?",
        ],
        bullets: [
          "Selling products — a manufacturer sells goods to distributors or stores",
          "Subscriptions — software companies charge monthly or yearly (SaaS)",
          "Services — agencies and consultancies sell time and expertise",
          "Commissions and fees — marketplaces take a cut of each transaction",
          "Advertising — platforms give content away free and charge advertisers for attention",
        ],
      },
      {
        id: "where-money-goes",
        heading: "Where money goes",
        paragraphs: [
          "Costs fall into two big buckets. Fixed costs stay roughly the same regardless of sales: office rent, salaries, insurance. Variable costs rise with each sale: raw materials, payment fees, shipping.",
          "Understanding this distinction explains many company decisions. A company with high fixed costs must chase volume to break even. A company with low fixed costs can survive on fewer sales — which is why some businesses seem tiny yet very profitable.",
        ],
      },
      {
        id: "profit-is-not-cash",
        heading: "Profit is not the same as cash",
        paragraphs: [
          "One surprise for newcomers: profitable companies can still die. Profit is an accounting concept measured over months; cash is physical money available today. If customers pay in 90 days but salaries are due Friday, a 'profitable' company can be unable to pay its bills.",
          "This is why finance teams watch cash flow as closely as profit — and why you'll hear phrases like 'runway' and 'we need to collect invoices' long before you'd expect them.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "Business = revenue − costs = profit, repeated forever",
          "Fixed vs variable costs explain pricing, scaling, and layoffs",
          "Profit and cash are different — companies die from lack of cash",
        ],
      },
    ],
  },
  {
    number: 3,
    slug: "departments",
    title: "Departments",
    description:
      "Why companies split into departments, what each one owns, and how they fit together.",
    readingTime: 7,
    level: "Beginner",
    sections: [
      {
        id: "why-departments",
        heading: "Why departments exist",
        paragraphs: [
          "When a company grows past a handful of people, generalists stop being efficient. Someone must own accounting. Someone must own hiring. Someone must answer customer emails. Departments are simply groups of people with related expertise who own a specific area of the business.",
          "Think of departments as organs in a body. Each has a distinct function, all depend on each other, and problems in one eventually affect the rest.",
        ],
      },
      {
        id: "core-groups",
        heading: "The core groups",
        paragraphs: [
          "Most companies organize their departments into four broad families:",
        ],
        bullets: [
          "Make and sell — Product, Engineering, Sales, Marketing, Customer Success",
          "Run the business — Operations, Finance, Legal, Procurement",
          "Manage people — Human Resources (often called People or Talent)",
          "Set direction — Executive leadership (CEO and C-level team)",
        ],
      },
      {
        id: "ownership",
        heading: "Ownership and handoffs",
        paragraphs: [
          "Each department owns certain outcomes. Finance owns accurate numbers. Sales owns bookings. Product owns what gets built. Ownership matters because when everyone is responsible, no one is responsible.",
          "Most real work, however, happens between departments — in the handoffs. A deal closes in Sales and becomes an implementation project for Customer Success. Marketing promises a launch date that Engineering must deliver. Understanding handoffs — and where they break — is one of the most useful things you can learn about a company.",
        ],
      },
      {
        id: "variations",
        heading: "They look different everywhere",
        paragraphs: [
          "Titles and structures vary. One company's 'Growth' team does marketing; another's builds product experiments. A 30-person startup may have no departments at all — just people wearing five hats. The names matter less than the functions: somewhere in every company, someone does each of these jobs.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "Departments = grouped expertise + clear ownership",
          "Four families: make & sell, run the business, manage people, set direction",
          "Real work happens at the handoffs between departments",
        ],
      },
    ],
  },
  {
    number: 4,
    slug: "organizational-hierarchy",
    title: "Organizational hierarchy",
    description:
      "Who reports to whom, what managers actually do, and why layers of management exist.",
    readingTime: 6,
    level: "Beginner",
    sections: [
      {
        id: "reporting-lines",
        heading: "Reporting lines",
        paragraphs: [
          "Hierarchy answers one question: who decides when people disagree? Each person has a manager — someone responsible for their output, growth, and priorities. That manager reports to another manager, and so on up to the CEO.",
          "This chain is called a reporting line, drawn as an org chart. It looks like power flowing downward, but accountability actually flows upward: your team misses its goals, your manager answers for it.",
        ],
      },
      {
        id: "why-layers",
        heading: "Why management layers exist",
        paragraphs: [
          "No person can effectively direct 100 people. Most managers handle between 5 and 10 direct reports — a span of control. As headcount grows, companies add layers: individual contributors → manager → director → VP → executive. Each layer translates strategy from above into concrete work below.",
          "More layers mean more coordination but slower decisions. This trade-off explains why startups decide fast (2 layers) while enterprises move deliberately (8+ layers) — and why growing companies constantly reorganize.",
        ],
      },
      {
        id: "managers-vs-makers",
        heading: "Managers vs makers",
        paragraphs: [
          "Two career tracks coexist in most companies. Individual contributors (ICs) get better at doing — writing code, closing deals, designing interfaces. Managers get better at enabling others — hiring, coaching, planning, unblocking.",
          "Neither track outranks the other by default. A Principal Engineer often earns more than the manager of their team. Titles signal responsibility, not personal worth.",
        ],
      },
      {
        id: "informal-influence",
        heading: "Formal vs informal influence",
        paragraphs: [
          "Org charts describe formal authority, but real influence also flows through informal networks: the engineer everyone trusts, the assistant who knows everything, the founder's sounding board. Newcomers often misread power by looking only at titles. Watch instead who gets consulted before big decisions.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "Hierarchy exists to resolve disagreements and translate strategy",
          "Span of control (~5–10) forces new layers as companies grow",
          "IC and manager tracks are parallel careers, not ranks of importance",
        ],
      },
    ],
  },
  {
    number: 5,
    slug: "how-decisions-are-made",
    title: "How decisions are made",
    description:
      "From daily choices to board-level bets — who decides what inside a company, and how.",
    readingTime: 6,
    level: "Intermediate",
    sections: [
      {
        id: "decision-types",
        heading: "Three speeds of decision",
        paragraphs: [
          "Companies make thousands of decisions daily across three rough categories:",
        ],
        bullets: [
          "Reversible, small — change a button, adjust a price, try a subject line. Decide fast, fix later if wrong.",
          "Hard to reverse, medium — sign a lease, hire a senior person, commit to a roadmap. Gather input, then decide.",
          "Existential, rare — acquire a competitor, enter a new country, shut down a product line. Slow down, analyze deeply, involve executives and sometimes the board.",
        ],
      },
      {
        id: "wrong-speed",
        heading: "When speed goes wrong",
        paragraphs: [
          "Problems start when companies apply the wrong speed — agonizing over button colors while sleepwalking into bad acquisitions.",
        ],
      },
      {
        id: "who-decides",
        heading: "Who actually decides",
        paragraphs: [
          "Healthy companies separate two roles: those who give input and the single person who decides. Committees advise; a named owner decides. Amazon calls this 'disagree and commit' — after the decision, even people who argued against it execute fully.",
          "Watch for decision rights in your own company. Sometimes the loudest voice wins; sometimes the most senior; sometimes whoever holds the budget. Knowing which game is being played is half the battle.",
        ],
      },
      {
        id: "data-and-opinion",
        heading: "Data, opinion, and precedent",
        paragraphs: [
          "Decisions draw on three fuels. Data — metrics, experiments, financials. Opinion — experience and judgment, essential when data doesn't exist yet. Precedent — 'we did this before', which speeds things up but can lock companies into an outdated past.",
          "Strong decision cultures state the reasoning out loud: what we believe, what evidence we have, what would change our mind.",
        ],
      },
      {
        id: "meetings",
        heading: "Where decisions happen: meetings",
        paragraphs: [
          "Despite the jokes, meetings exist to synchronize decisions that email cannot settle. Good meetings end with three artifacts: a decision, an owner, and a deadline. If yours regularly ends with none of these, the meeting is a status update — which could have been a message.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "Match decision speed to reversibility",
          "Input can come from many; the decision needs one named owner",
          "Good meetings produce a decision, an owner, and a date",
        ],
      },
    ],
  },
  {
    number: 6,
    slug: "customers-and-markets",
    title: "Customers and markets",
    description:
      "Who companies serve, how markets work, and why 'the customer' is more complicated than it sounds.",
    readingTime: 6,
    level: "Beginner",
    sections: [
      {
        id: "customers",
        heading: "B2B vs B2C",
        paragraphs: [
          "Companies serve two broad customer types. B2C (business-to-consumer) sells to individuals: Netflix, supermarkets, airlines. B2B (business-to-business) sells to other companies: software vendors, consultancies, machinery makers.",
          "The difference shapes everything. Consumers buy emotionally, decide quickly, and pay small amounts. Businesses buy rationally through committees, decide slowly, and pay large amounts. Same product category, completely different playbook — which is why marketing and sales look so different across companies.",
        ],
      },
      {
        id: "users-vs-payers",
        heading: "Users vs buyers",
        paragraphs: [
          "In B2B especially, the person using a product is rarely the person paying for it. Engineers use development tools; a procurement manager signs the contract. Patients use medicines; insurers pay. Successful companies design for users and sell to buyers — confusing the two is a classic failure mode.",
        ],
      },
      {
        id: "markets",
        heading: "What 'market' means",
        paragraphs: [
          "A market is simply the group of customers who might buy, plus competitors offering alternatives. 'Market size' estimates total possible spending: TAM (everyone theoretically), SAM (segments you can realistically serve), SOM (share you can win soon).",
          "Markets also have moods. Growing markets lift average companies to success; shrinking markets force excellent ones to fight for scraps. When evaluating any company, ask: is this ocean rising or falling?",
        ],
      },
      {
        id: "competition",
        heading: "Competition and differentiation",
        paragraphs: [
          "Customers always have alternatives — including doing nothing. Companies therefore need differentiation: a reason to be chosen. Common strategies include cheaper, better, faster, niche-focused, or integrated with tools customers already use.",
          "'Cheaper' is the hardest position to hold, because anyone can undercut it. That's why companies fight hard to compete on trust, quality, or unique capability instead.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "B2C sells emotion and speed; B2B sells logic and committees",
          "Design for users, sell to buyers",
          "TAM/SAM/SOM sizes the prize; market direction matters as much as position",
        ],
      },
    ],
  },
  {
    number: 7,
    slug: "revenue-and-costs",
    title: "Revenue and costs",
    description:
      "How to read the money story of any company — where cash comes from and where it leaks.",
    readingTime: 7,
    level: "Intermediate",
    sections: [
      {
        id: "revenue-quality",
        heading: "Not all revenue is equal",
        paragraphs: [
          "$1M of revenue tells you little on its own. The interesting questions: Is it recurring (subscriptions) or one-time (project work)? Is it growing? Does it cost more to acquire than it returns? High-quality revenue repeats without heavy re-selling — which is why investors pay far more for recurring revenue businesses.",
        ],
      },
      {
        id: "cost-structure",
        heading: "Reading a cost structure",
        paragraphs: [
          "A typical company's costs break into a few familiar lines: cost of goods sold (directly producing the product), research & development (building what's next), sales & marketing (finding customers), and general & administrative (everything else, including HR, finance, legal, offices).",
          "Comparing these proportions across companies reveals business models instantly. A company spending 50% on R&D is betting on future products. One spending 60% on sales is buying growth now.",
        ],
      },
      {
        id: "margins",
        heading: "Margins: the health gauge",
        paragraphs: [
          "Gross margin — what remains after production costs — shows whether the core product makes money. Net margin — what remains after absolutely everything — shows whether the whole machine works. Software famously enjoys gross margins of 70–90%; grocery stores survive on 1–3%. Neither is 'better'; they are different games requiring different discipline.",
        ],
      },
      {
        id: "unit-economics",
        heading: "Unit economics",
        paragraphs: [
          "Zooming in: does one customer make money? Compare LTV (total profit from a customer over time) against CAC (cost to acquire them). A healthy rule of thumb: LTV should exceed CAC by at least 3×, and CAC should be recovered within 12–18 months.",
          "Many famous failures looked great on revenue while losing money on every single customer — growth funded by investors rather than economics. Unit economics reveal that truth early.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "Ask about revenue quality: recurring, growing, economical to acquire?",
          "Cost proportions expose the business model at a glance",
          "LTV:CAC ≥ 3 is the classic health benchmark per customer",
        ],
      },
    ],
  },
  {
    number: 8,
    slug: "kpis",
    title: "KPIs",
    description:
      "The numbers companies live by — how measurement works, and how it goes wrong.",
    readingTime: 6,
    level: "Beginner",
    sections: [
      {
        id: "what-kpis-do",
        heading: "What KPIs actually do",
        paragraphs: [
          "KPIs (key performance indicators) compress a complicated business into a handful of numbers a team checks weekly. They exist because attention is scarce: nobody can monitor everything, so organizations pick vital signals — revenue, churn, delivery time — and agree to care about them together.",
        ],
      },
      {
        id: "good-vs-bad",
        heading: "What separates good KPIs from noise",
        paragraphs: ["Useful KPIs share four traits:"],
        bullets: [
          "Tied to value — connected to revenue, cost, or customer outcomes, not vanity",
          "Moveable — the team can actually influence the number",
          "Timely — visible fast enough to act on",
          "Paired — balanced with a counter-metric so gaming one doesn't wreck another (e.g., speed paired with quality)",
        ],
      },
      {
        id: "north-star",
        heading: "North star metrics",
        paragraphs: [
          "Many companies choose one north star metric capturing delivered value: Airbnb uses nights booked, Spotify listening hours. A good north star aligns thousands of daily micro-decisions without central approval. It should measure value delivered to customers, not merely money extracted — otherwise teams optimize extraction until customers leave.",
        ],
      },
      {
        id: "dark-side",
        heading: "The dark side of measurement",
        paragraphs: [
          "Goodhart's law strikes whenever a measure becomes a target: 'When a measure becomes a target, it ceases to be a good measure.' Support agents graded on ticket closure speed close tickets unresolved. Salespeople chasing quarterly quotas push deals customers regret. Call-center staff graded on call length hang up on you.",
          "Defend yourself with pairing (speed + quality), common sense, and periodic sanity checks asking: does this number reflect reality?",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "KPIs focus scarce attention on vital signals",
          "Good KPIs are tied to value, movable, timely, and paired with counter-metrics",
          "Targets corrupt measures — design for gaming before it happens",
        ],
      },
    ],
  },
  {
    number: 9,
    slug: "strategy",
    title: "Strategy",
    description:
      "What strategy actually is (spoiler: not a slide deck), and how to recognize good strategy.",
    readingTime: 7,
    level: "Intermediate",
    sections: [
      {
        id: "definition",
        heading: "Strategy is choosing",
        paragraphs: [
          "Strip away the jargon and strategy means deciding where to play and how to win. Where to play: which customers, which markets, which segments. How to win: why customers should choose you there over every alternative.",
          "Because strategy is about choice, saying 'no' is the essence of it. A company that chases every opportunity has no strategy — it has a wish list. Real strategy concentrates resources where the company has an actual edge.",
        ],
      },
      {
        id: "levels",
        heading: "Strategy happens at three levels",
        bullets: [
          "Corporate strategy — Which businesses should we be in? (Should a search engine build self-driving cars?)",
          "Business strategy — How do we win in this market? (Compete on price, brand, or technology?)",
          "Functional strategy — How does each department contribute? (Sales focuses enterprise accounts; product prioritizes integrations.)",
        ],
        paragraphs: [
          "Misalignment between levels causes most strategic confusion. Teams executing last year's corporate strategy, departments pulling in opposite directions — these feel like people problems but are usually strategy-communication problems.",
        ],
      },
      {
        id: "recognizing-good-strategy",
        heading: "Recognizing good strategy",
        paragraphs: [
          "Richard Rumelt's test: good strategy contains a diagnosis (what's really the problem?), a guiding policy (our approach), and coherent action (things we'll actually do). Bad strategy substitutes ambition ('be #1!') and buzzwords for diagnosis and choice.",
          "Quick smell test for any strategy document: Could this only be true of this company? If you can swap in a competitor's logo and nothing breaks, it isn't strategy — it's decoration.",
        ],
      },
      {
        id: "strategy-vs-planning",
        heading: "Strategy vs planning",
        paragraphs: [
          "Plans assume you know the path; strategy assumes uncertainty and sets a direction plus the ability to adapt. Both matter, but confusing them is dangerous — companies rigidly executing plans built for a world that changed. Strategy is a hypothesis, continuously tested by results.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "Strategy = where to play + how to win + what to say no to",
          "Align three levels: corporate, business, functional",
          "Good strategy diagnoses first; ambition alone is not strategy",
        ],
      },
    ],
  },
  {
    number: 10,
    slug: "how-everything-connects",
    title: "How everything connects",
    description:
      "Bringing it together: follow one dollar and one decision through the whole system.",
    readingTime: 8,
    level: "Intermediate",
    sections: [
      {
        id: "one-dollar",
        heading: "Following one dollar",
        paragraphs: [
          "Trace a single purchase through the machine. Marketing spends budget attracting attention → a prospect visits the site → Sales qualifies and closes the deal → Finance books the revenue → Operations fulfills the order → Customer Success keeps the account healthy → next year, Finance forecasts renewal based on CS health scores.",
          "No department controls the whole chain, yet the company lives or dies by how smoothly dollars travel it. Friction anywhere — bad leads, slow contracts, poor fulfillment — bleeds money everywhere else.",
        ],
      },
      {
        id: "one-decision",
        heading: "Following one decision",
        paragraphs: [
          "Now trace a decision upward. An engineer notices customers churning over a missing feature → files insight to Product → Product reprioritizes the roadmap → Executives see retention risk in quarterly data → Finance adjusts forecast → Board hears updated strategy. One frontline observation reshapes company-level plans within weeks.",
          "This is the real reason hierarchy exists: not status, but signal transmission. Healthy companies transmit frontline truth upward quickly and decisions downward clearly.",
        ],
      },
      {
        id: "systems-view",
        heading: "Thinking in systems",
        paragraphs: [
          "With lessons 1–9 assembled, you can read any company like a system: people organized into departments (3) with clear ownership (3), arranged in hierarchy (4) that channels decisions (5), serving customers in markets (6), driven by revenue and costs (2, 7), steered by KPIs (8) toward a strategy (9).",
          "When something feels broken at work, locate it in this model: Is ownership unclear? Is signal stuck between levels? Are metrics fighting each other? Diagnosis precedes frustration-reduction — and occasionally, promotion.",
        ],
      },
      {
        id: "keep-learning",
        heading: "Where to go next",
        paragraphs: [
          "You now hold the complete map. Deepen it by exploring Departments for role-by-role detail, Business Fundamentals for the money concepts, Scenarios to see the system under stress, and the Glossary to decode the vocabulary you'll hear in meetings.",
          "CompanyOS is open source — improve explanations you find unclear, add terms you had to Google, and help the next person learn faster.",
        ],
      },
      {
        id: "takeaways",
        heading: "Key takeaways",
        bullets: [
          "Dollars flow: marketing → sales → finance → ops → success → repeat",
          "Hierarchy is signal transmission, not status",
          "Locate problems in the system map before blaming people",
        ],
      },
    ],
  },
];

export const lessonBySlug = (slug: string) =>
  lessons.find((l) => l.slug === slug);
