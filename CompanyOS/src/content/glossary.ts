import type { GlossaryTerm } from "./types";

export const glossary: GlossaryTerm[] = [
  // ── Finance ──────────────────────────────────────────────
  {
    term: "Revenue",
    category: "Finance",
    definition:
      "Total income earned from selling products or services during a period, before any costs are deducted.",
    simple: "All the money coming in from sales.",
    example: "Selling 500 units at $40 each = $20,000 revenue.",
  },
  {
    term: "Profit",
    category: "Finance",
    definition:
      "The amount remaining after subtracting all costs from revenue; the financial gain of the business.",
    simple: "What's left after paying for everything.",
    example: "$100K revenue − $80K costs = $20K profit.",
  },
  {
    term: "EBITDA",
    category: "Finance",
    definition:
      "Earnings Before Interest, Taxes, Depreciation, and Amortization — profit from core operations, ignoring financing and accounting adjustments.",
    simple: "How much the core business earns before accounting tricks and loan costs.",
    example:
      "Used to compare companies fairly — two firms with identical operations but different debt levels show similar EBITDA.",
  },
  {
    term: "Gross Margin",
    category: "Finance",
    definition:
      "Percentage of revenue remaining after subtracting direct production costs (COGS).",
    simple: "Of each sales dollar, how much survives making the product.",
    example: "Software gross margins run 70–90%; groceries survive on 1–3%.",
  },
  {
    term: "Cash Flow",
    category: "Finance",
    definition:
      "The actual movement of money into and out of the company during a period.",
    simple: "Real cash moving — not the same as profit on paper.",
    example:
      "A profitable firm can fail because customers pay late while payroll is due Friday.",
  },
  {
    term: "Burn Rate",
    category: "Finance",
    definition:
      "Net amount of cash consumed per month when spending exceeds income.",
    simple: "How fast the bank account shrinks monthly.",
    example: "$900K out, $650K in per month → burn rate $250K/month.",
  },
  {
    term: "Runway",
    category: "Finance",
    definition:
      "Number of months a company can operate at current burn rate before exhausting cash.",
    simple: "Countdown until money runs out.",
    example: "$1.5M cash ÷ $125K monthly burn = 12 months of runway.",
  },
  {
    term: "CapEx",
    category: "Finance",
    definition:
      "Capital Expenditure — spending on long-lasting assets like buildings, machines, or major software.",
    simple: "Big purchases that last years.",
    example: "Buying servers or a factory is CapEx; monthly electricity is not.",
  },
  {
    term: "OpEx",
    category: "Finance",
    definition:
      "Operating Expenditure — regular costs of running the business: salaries, rent, subscriptions.",
    simple: "Everyday running costs.",
    example: "Salaries and SaaS licenses hit OpEx; a new office building hits CapEx.",
  },
  {
    term: "Fixed Costs",
    category: "Finance",
    definition:
      "Costs that stay constant regardless of sales volume within a range.",
    simple: "Bills you pay no matter what.",
    example: "Rent stays $10K whether you sell 10 or 10,000 units.",
  },
  {
    term: "Variable Costs",
    category: "Finance",
    definition:
      "Costs that rise or fall directly with production or sales volume.",
    simple: "Costs that grow with every sale.",
    example: "Packaging and shipping rise with each order shipped.",
  },
  {
    term: "Break-even Point",
    category: "Finance",
    definition:
      "The sales level where total revenue exactly equals total costs — zero profit, zero loss.",
    simple: "Where you stop losing money.",
    example:
      "If fixed costs are $50K and margin per unit is $25 → break-even at 2,000 units.",
  },
  {
    term: "Budget",
    category: "Finance",
    definition:
      "A formal plan allocating spending across teams and categories for an upcoming period.",
    simple: "Agreed spending limits per team.",
    example:
      "Marketing approved for $100K/month — going over requires justification and sign-off.",
  },
  {
    term: "Forecast",
    category: "Finance",
    definition:
      "A prediction of future financial performance based on current data and assumptions.",
    simple: "Best guess at next quarter's numbers.",
    example:
      "'We forecast $2.3M revenue next quarter' guides hiring plans made today.",
  },

  // ── Metrics ──────────────────────────────────────────────
  {
    term: "KPI",
    category: "Metrics",
    definition:
      "Key Performance Indicator — a chosen metric representing success for a team or company.",
    simple: "The few numbers everyone agrees matter most.",
    example: "Support KPIs: first-response time, resolution time, CSAT.",
  },
  {
    term: "OKR",
    category: "Metrics",
    definition:
      "Objectives and Key Results — goal framework pairing an inspiring qualitative objective with measurable key results.",
    simple: "Big goal + numbers that prove progress.",
    example:
      "Objective: 'Best-in-class onboarding.' KR: activation rate from 40%→60% this quarter.",
  },
  {
    term: "ROI",
    category: "Metrics",
    definition:
      "Return on Investment — gain versus cost of an investment, expressed as a percentage.",
    simple: "Was it worth what we spent?",
    example: "$10K ads returning $15K extra profit = 150% ROI.",
  },
  {
    term: "CAC",
    category: "Metrics",
    definition:
      "Customer Acquisition Cost — average sales and marketing spend to win one new customer.",
    simple: "Price tag on winning a customer.",
    example: "$200K spend acquiring 80 customers = $2,500 CAC.",
  },
  {
    term: "LTV",
    category: "Metrics",
    definition:
      "Lifetime Value — total profit expected from a customer across the entire relationship.",
    simple: "Everything one customer will ever be worth.",
    example: "$50/month × 24 months × 80% margin ≈ $960 LTV.",
  },
  {
    term: "ARR",
    category: "Metrics",
    definition:
      "Annual Recurring Revenue — yearly value of active subscription contracts.",
    simple: "Subscription income, normalized to a year.",
    example: "$120K monthly recurring = $1.44M ARR.",
  },
  {
    term: "MRR",
    category: "Metrics",
    definition:
      "Monthly Recurring Revenue — month-scale value of active subscriptions.",
    simple: "This month's predictable subscription income.",
    example: "300 subscribers averaging $50/month = $15K MRR.",
  },
  {
    term: "Churn",
    category: "Metrics",
    definition:
      "Rate at which customers or revenue cancel over a period.",
    simple: "How many customers leave.",
    example: "Losing 5 of 100 subscribers monthly = 5% monthly churn.",
  },
  {
    term: "NRR",
    category: "Metrics",
    definition:
      "Net Revenue Retention — percentage of revenue kept from existing customers including expansions, after churn and downgrades.",
    simple: "Do existing customers spend more each year, net?",
    example: "NRR above 110% means customer base grows even without new sales.",
  },
  {
    term: "NPS",
    category: "Metrics",
    definition:
      "Net Promoter Score — loyalty metric from asking 'would you recommend us?' (0–10); promoters minus detractors.",
    simple: "Would customers recommend you?",
    example: "70% promoters (9–10) − 10% detractors (0–6) → NPS of +60.",
  },
  {
    term: "Vanity Metric",
    category: "Metrics",
    definition:
      "A number that looks impressive but doesn't inform decisions or reflect real value.",
    simple: "Feels-good numbers that mean nothing.",
    example: "Total registered users hides that nobody logs in after day one.",
  },
  {
    term: "North Star Metric",
    category: "Metrics",
    definition:
      "Single metric best capturing the value delivered to customers, used to align whole-company effort.",
    simple: "The one number that says we're winning.",
    example: "Spotify: total listening hours. Airbnb: nights booked.",
  },
  {
    term: "Payback Period",
    category: "Metrics",
    definition:
      "Time required for a customer's revenue to repay their acquisition cost.",
    simple: "How long until a customer pays back their own price tag.",
    example: "$2,400 CAC with $200/month contribution = 12-month payback.",
  },

  // ── Market & Strategy ────────────────────────────────────
  {
    term: "TAM / SAM / SOM",
    category: "Market & Strategy",
    definition:
      "Total Addressable Market, Serviceable Addressable Market, Serviceable Obtainable Market — market size at three narrowing scopes.",
    simple: "Everyone who could buy → those you can serve → those you can realistically win.",
    example:
      "Global CRM software $80B (TAM), mid-market EU firms $4B (SAM), our year-one target $20M (SOM).",
  },
  {
    term: "Moat",
    category: "Market & Strategy",
    definition:
      "A durable competitive advantage protecting profits from competitors — network effects, brand, switching costs, scale, patents.",
    simple: "Why competitors can't easily copy you.",
    example: "Marketplaces gain moats through network effects: more buyers attract more sellers.",
  },
  {
    term: "Business Model",
    category: "Market & Strategy",
    definition:
      "The system describing how a company creates, delivers, and captures value.",
    simple: "How the company makes money.",
    example: "Netflix subscribes viewers; cinemas sell per-ticket; YouTube monetizes attention via ads.",
  },
  {
    term: "Positioning",
    category: "Market & Strategy",
    definition:
      "The deliberate place a product occupies in target customers' minds relative to alternatives.",
    simple: "What people think of when they think of you.",
    example: "Volvo owns 'safety'; Rolex owns luxury; Volvo ads never compete on cheapness.",
  },
  {
    term: "USP",
    category: "Market & Strategy",
    definition:
      "Unique Selling Proposition — the single distinct benefit only your offer provides.",
    simple: "Your one-of-a-kind promise.",
    example: "Domino's once built an empire on 'fresh hot pizza in 30 minutes or less.'",
  },
  {
    term: "Pivot",
    category: "Market & Strategy",
    definition:
      "A structured change of business direction when the current approach fails to gain traction.",
    simple: "Changing course without sinking the ship.",
    example: "Slack pivoted from a failed game into workplace chat — keeping internal tooling.",
  },
  {
    term: "SWOT",
    category: "Market & Strategy",
    definition:
      "Analysis framework listing Strengths, Weaknesses, Opportunities, and Threats.",
    simple: "Four-box reality check about position.",
    example: "Boards open strategy offsites with SWOT to ground discussion.",
  },
  {
    term: "B2B",
    category: "Market & Strategy",
    definition:
      "Business-to-Business — selling products or services to other companies.",
    simple: "Selling to companies, not people.",
    example: "Salesforce selling CRM tools to enterprises is B2B.",
  },
  {
    term: "B2C",
    category: "Market & Strategy",
    definition:
      "Business-to-Consumer — selling directly to individual end users.",
    simple: "Selling to everyday people.",
    example: "Spotify Premium sold to individuals is B2C.",
  },
  {
    term: "SaaS",
    category: "Market & Strategy",
    definition:
      "Software as a Service — software licensed via subscription and accessed through the cloud.",
    simple: "Renting software instead of buying it.",
    example: "Google Workspace and Figma are SaaS — no downloads, monthly billing.",
  },

  // ── Sales & Customers ────────────────────────────────────
  {
    term: "Pipeline",
    category: "Sales & Customers",
    definition:
      "All active sales opportunities tracked through stages toward closing.",
    simple: "Deals currently being worked.",
    example: "'Our pipeline covers 3.2× quota' means enough deals in motion to likely hit targets.",
  },
  {
    term: "Quota",
    category: "Sales & Customers",
    definition:
      "The revenue target a salesperson must close within a period.",
    simple: "A seller's personal number to hit.",
    example: "AE quota of $120K/quarter drives daily activity prioritization.",
  },
  {
    term: "Lead",
    category: "Sales & Customers",
    definition:
      "A potential customer identified but not yet qualified; progresses through MQL and SQL stages.",
    simple: "Someone who might become a buyer.",
    example: "Webinar attendee downloads guide → becomes lead → marketing scores interest.",
  },
  {
    term: "Win Rate",
    category: "Sales & Customers",
    definition:
      "Percentage of pursued deals that end in closed-won status.",
    simple: "How often you win deals you chase.",
    example: "Won 12 of 40 proposals = 30% win rate.",
  },
  {
    term: "ACV",
    category: "Sales & Customers",
    definition:
      "Average Contract Value — typical annual worth of a signed deal.",
    simple: "Normal size of a deal.",
    example: "$2M from 25 contracts averages $80K ACV — enterprise territory.",
  },
  {
    term: "Upsell",
    category: "Sales & Customers",
    definition:
      "Selling additional capacity or higher tiers of the same product to existing customers.",
    simple: "Getting customers to buy bigger versions.",
    example: "Moving from 10-seat plan to 25-seat plan is an upsell.",
  },
  {
    term: "Cross-sell",
    category: "Sales & Customers",
    definition:
      "Selling different, complementary products to existing customers.",
    simple: "Selling related extras alongside.",
    example: "Bank offering credit cards to its checking-account customers.",
  },

  // ── People & Organization ────────────────────────────────
  {
    term: "Stakeholder",
    category: "People & Organization",
    definition:
      "Any person or group affected by, or able to affect, the company's outcomes — employees, customers, investors, communities.",
    simple: "Anyone with skin in the game.",
    example:
      "A factory relocation involves stakeholders from workers and unions to local government.",
  },
  {
    term: "Shareholder",
    category: "People & Organization",
    definition:
      "An owner of shares in the company, entitled to portions of profits and certain voting rights.",
    simple: "Someone who owns a piece of the company.",
    example: "Apple shareholders receive dividends and vote on board elections.",
  },
  {
    term: "Board of Directors",
    category: "People & Organization",
    definition:
      "Elected group representing shareholders that oversees executives and approves major decisions.",
    simple: "The boss of the CEO.",
    example: "Boards approve acquisitions, CEO pay, and sometimes fire CEOs.",
  },
  {
    term: "Org Chart",
    category: "People & Organization",
    definition:
      "Diagram showing reporting relationships and hierarchy across the organization.",
    simple: "Map of who reports to whom.",
    example: "New hires study org charts to learn decision paths quickly.",
  },
  {
    term: "Span of Control",
    category: "People & Organization",
    definition:
      "Number of direct reports managed by one person.",
    simple: "How many people answer to one boss.",
    example: "Effective spans run 5–10; wider spans force flatter organizations.",
  },
  {
    term: "Silo",
    category: "People & Organization",
    definition:
      "A department that hoards information and works in isolation from others.",
    simple: "Teams that don't talk to each other.",
    example: "Marketing promising features engineering never heard of = classic silo damage.",
  },
  {
    term: "Headcount",
    category: "People & Organization",
    definition:
      "The approved number of employees, or a specific authorized position.",
    simple: "Allowed number of people to hire.",
    example: "'There's open headcount in Platform' means budget exists to hire there.",
  },
  {
    term: "Individual Contributor (IC)",
    category: "People & Organization",
    definition:
      "An employee responsible for their own output rather than managing others' work.",
    simple: "Someone who does the work themselves.",
    example: "Senior engineers often stay ICs, earning as much as managers do.",
  },
  {
    term: "Attrition",
    category: "People & Organization",
    definition:
      "Rate at which employees leave the company over time, voluntarily or not.",
    simple: "How fast people quit.",
    example: "20% annual attrition means replacing a fifth of staff each year.",
  },
  {
    term: "Onboarding",
    category: "People & Organization",
    definition:
      "Structured process integrating new employees or customers into productive use.",
    simple: "Getting someone up and running.",
    example: "Good onboarding gets engineers deploying code in week one.",
  },

  // ── Product & Delivery ───────────────────────────────────
  {
    term: "MVP",
    category: "Product & Delivery",
    definition:
      "Minimum Viable Product — smallest releasable version that tests the core hypothesis with real users.",
    simple: "Simplest version worth launching.",
    example: "Airbnb began as one apartment, one weekend, one basic webpage.",
  },
  {
    term: "Roadmap",
    category: "Product & Delivery",
    definition:
      "Prioritized plan of upcoming product work across time horizons.",
    simple: "The product's planned future.",
    example: "'Now / Next / Later' roadmaps communicate priorities without fake precision.",
  },
  {
    term: "Backlog",
    category: "Product & Delivery",
    definition:
      "Prioritized list of all pending work items for a development team.",
    simple: "To-do list for the build team.",
    example: "Groomed backlogs hold ready-to-build stories; messy ones hide chaos.",
  },
  {
    term: "Sprint",
    category: "Product & Delivery",
    definition:
      "Fixed short cycle (usually two weeks) in which a committed set of work is completed.",
    simple: "A two-week work chunk.",
    example: "Sprint planning Monday commits scope; sprint review demos results Friday two weeks later.",
  },
  {
    term: "Technical Debt",
    category: "Product & Delivery",
    definition:
      "Accumulated shortcuts in code or architecture that slow future development until repaid.",
    simple: "Building fast now, paying later.",
    example: "Skipping tests ships faster today; debugging regressions consumes months later.",
  },
  {
    term: "SOP",
    category: "Product & Delivery",
    definition:
      "Standard Operating Procedure — documented step-by-step method for performing a recurring task.",
    simple: "Written recipe for doing things right here.",
    example: "Opening checklist SOPs let coffee shops run identically across locations.",
  },
  {
    term: "SLA",
    category: "Product & Delivery",
    definition:
      "Service Level Agreement — contractual promise of response times, uptime, or quality levels.",
    simple: "Written promise of service speed.",
    example: "99.9% uptime SLA permits roughly 43 minutes downtime monthly.",
  },
  {
    term: "Scalability",
    category: "Product & Delivery",
    definition:
      "Ability of systems or processes to handle growth without proportional cost or breakdown.",
    simple: "Can it grow without breaking?",
    example: "Manual onboarding breaks at 100 customers; automated flows scale to thousands.",
  },

  // ── Funding & Deals ──────────────────────────────────────
  {
    term: "Bootstrapping",
    category: "Funding & Deals",
    definition:
      "Building a company using its own revenue without external investor funding.",
    simple: "Growing on your own money.",
    example: "Mailchimp bootstrapped for two decades before a $12B exit.",
  },
  {
    term: "Venture Capital",
    category: "Funding & Deals",
    definition:
      "Investment funds purchasing equity in high-growth startups expecting outsized returns.",
    simple: "Investors buying startup stakes betting on huge wins.",
    example: "VCs funded Uber's losses for years betting on eventual dominance.",
  },
  {
    term: "IPO",
    category: "Funding & Deals",
    definition:
      "Initial Public Offering — the event where company shares first trade publicly on a stock exchange.",
    simple: "When anyone can buy stock in the company.",
    example: "Stripe remains private; Snowflake's 2020 IPO raised nearly $14B.",
  },
  {
    term: "Acquisition",
    category: "Funding & Deals",
    definition:
      "Purchase of one company by another, absorbing ownership and often integrating operations.",
    simple: "One company buys another.",
    example: "Microsoft acquired GitHub for $7.5B in 2018.",
  },
];

export const glossaryCategories = Array.from(
  new Set(glossary.map((t) => t.category)),
);

export const glossaryByLetter = () => {
  const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term));
  const map = new Map<string, GlossaryTerm[]>();
  for (const t of sorted) {
    const letter = t.term[0].toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(t);
  }
  return map;
};
