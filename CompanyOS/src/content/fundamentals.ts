import type { Fundamental } from "./types";

export const fundamentals: Fundamental[] = [
  {
    slug: "revenue",
    name: "Revenue",
    category: "Money In",
    tagline: "The top line — total money earned from selling.",
    simpleDefinition:
      "Revenue is the total money a company earns from selling its products or services, before subtracting any costs.",
    whyItMatters:
      "Revenue shows whether people actually want what the company sells. It funds everything else — salaries, rent, growth. When executives say 'top line', they mean revenue, because it sits at the top of the income statement.",
    example:
      "If a company sells 1,000 subscriptions for $20 each per month, monthly revenue is $20,000.",
    keyPoints: [
      "Recorded when earned, not necessarily when cash arrives",
      "'Top line' = revenue; 'bottom line' = net profit",
      "Recurring revenue (subscriptions) is valued higher than one-time sales",
    ],
    related: ["costs", "gross-profit", "arr", "mrr"],
  },
  {
    slug: "costs",
    name: "Costs",
    category: "Money Out",
    tagline: "Everything the company spends to operate.",
    simpleDefinition:
      "Costs (or expenses) are all the money a company spends: salaries, rent, materials, software, marketing, and everything else.",
    whyItMatters:
      "Profit equals revenue minus costs, so costs are half of the profitability equation. Companies separate fixed costs (same every month, like rent) from variable costs (rise with sales, like shipping). Understanding this explains pricing, layoffs, and scaling decisions.",
    example:
      "A bakery's rent ($2,000/month, fixed) doesn't change with loaves sold; its flour cost (variable) rises with every extra batch.",
    keyPoints: [
      "Fixed vs variable costs behave differently as sales change",
      "COGS = costs directly tied to producing the product",
      "OpEx = ongoing operating expenses like salaries and software",
    ],
    related: ["gross-profit", "net-profit", "burn-rate", "budget"],
  },
  {
    slug: "gross-profit",
    name: "Gross Profit",
    category: "Profit & Cash",
    tagline: "What remains after making the product.",
    simpleDefinition:
      "Gross profit is revenue minus the direct costs of producing your product or service (COGS). It ignores overhead like offices and HR.",
    whyItMatters:
      "Gross profit answers: does the core product make money at all? A company can have huge revenue but if production eats 95% of it, there's nothing left for everything else. Gross margin (gross profit ÷ revenue) reveals the business model instantly — software often runs 70–90%, grocery stores 1–3%.",
    example:
      "Sell a course for $100 that costs $30 in hosting and payment fees → gross profit $70, gross margin 70%.",
    keyPoints: [
      "Gross margin exposes the fundamental economics of the model",
      "High margins fund growth; low margins require volume discipline",
      "Investors compare gross margins across competitors constantly",
    ],
    related: ["revenue", "costs", "net-profit"],
  },
  {
    slug: "net-profit",
    name: "Net Profit",
    category: "Profit & Cash",
    tagline: "The bottom line after absolutely everything.",
    simpleDefinition:
      "Net profit is what remains after subtracting all costs from revenue — including taxes, interest, and overhead. It's 'the bottom line'.",
    whyItMatters:
      "Net profit is the final verdict on whether the whole business works. Positive net profit means the company creates more value than it consumes; sustained losses mean someone (usually investors) is funding the gap.",
    example:
      "$1M revenue − $600K production − $250K salaries/rent/software − $50K taxes = $100K net profit (10% net margin).",
    keyPoints: [
      "Net margin = net profit ÷ revenue",
      "Losses are acceptable temporarily if funded and strategic",
      "GAAP rules define exactly what counts as a cost",
    ],
    related: ["gross-profit", "revenue", "cash-flow", "ebitda"],
  },
  {
    slug: "cash-flow",
    name: "Cash Flow",
    category: "Profit & Cash",
    tagline: "Actual money moving in and out — right now.",
    simpleDefinition:
      "Cash flow tracks real cash entering and leaving the company during a period. Profitable on paper companies can still run out of actual cash.",
    whyItMatters:
      "Cash pays salaries Friday; profit is an accounting opinion about the quarter. Timing gaps between spending and getting paid kill companies — especially fast-growing ones who pay suppliers now and collect from customers in 90 days. 'Cash is king' exists because of this lesson.",
    example:
      "A consultancy signs a $120K annual contract (profitable!) paid quarterly in arrears. It must cover three months of payroll before the first $30K arrives.",
    keyPoints: [
      "Operating, investing, financing are the three cash-flow categories",
      "Negative operating cash flow requires external funding eventually",
      "DSO (days sales outstanding) measures how fast customers pay",
    ],
    related: ["burn-rate", "runway", "net-profit"],
  },
  {
    slug: "budget",
    name: "Budget",
    category: "Money Out",
    tagline: "Planned spending agreed before the year starts.",
    simpleDefinition:
      "A budget is the plan for how much money each team can spend during a period, approved by finance and leadership.",
    whyItMatters:
      "Budgets turn strategy into resource allocation. They also create accountability: teams explain variances between plan and reality. 'That's not in the budget' is often the real reason behind decisions — understanding budget cycles helps you time requests.",
    example:
      "Marketing gets a $1.2M annual budget split $500K ads / $400K events / $300K tools & content. Mid-year overperformance triggers a reforecast discussion.",
    keyPoints: [
      "Annual budget + quarterly reforecasts is the common rhythm",
      "Variance analysis explains plan-vs-actual gaps",
      "Zero-based budgeting restarts from zero yearly; incremental adjusts last year's",
    ],
    related: ["costs", "forecast", "burn-rate"],
  },
  {
    slug: "financial-statements",
    name: "Financial Statements",
    category: "Metrics",
    tagline: "The three documents describing a company financially.",
    simpleDefinition:
      "Financial statements are standardized reports: the Income Statement (profitability), Balance Sheet (what's owned/owed at a moment), and Cash Flow Statement (actual cash movement).",
    whyItMatters:
      "These three documents are how companies communicate financial truth to outsiders — investors, banks, acquirers, regulators. Learning to skim them lets you assess any company's health in minutes instead of trusting press releases.",
    example:
      "Before investing, an analyst checks: Is revenue growing? (Income statement) Can they survive a bad year? (Balance sheet) Are they burning cash? (Cash flow statement)",
    keyPoints: [
      "Income statement covers a period; balance sheet is a snapshot",
      "All three interconnect — net profit flows into equity into cash",
      "Public companies file quarterly (10-Q) and annually (10-K) with SEC",
    ],
    related: ["revenue", "net-profit", "cash-flow"],
  },
  {
    slug: "business-models",
    name: "Business Models",
    category: "Strategy",
    tagline: "How a company creates, delivers, and captures value.",
    simpleDefinition:
      "A business model describes how a company makes money: who pays, for what, through which mechanism, and at what cost structure.",
    whyItMatters:
      "Two companies selling identical products can have wildly different economics depending on their model — subscription vs one-time sale, marketplace vs direct retail, free-with-ads vs paid. Understanding models lets you predict behavior: why Amazon loses money on devices, why Netflix cares about watch hours.",
    example:
      "Common models: SaaS subscription (Salesforce), freemium (Slack), marketplace commission (Airbnb), advertising (Google), razor-and-blades (printers + ink), licensing (ARM).",
    keyPoints: [
      "Model choice determines metrics that matter (ARR vs GMV vs MAU)",
      "Recurring models get valued higher due to predictability",
      "Models can be disrupted — see streaming vs DVD rental",
    ],
    related: ["pricing", "revenue", "ltv"],
  },
  {
    slug: "pricing",
    name: "Pricing",
    category: "Strategy",
    tagline: "Deciding what to charge — the highest-leverage number.",
    simpleDefinition:
      "Pricing is how much you charge customers. Small pricing changes flow directly to profit because costs don't move.",
    whyItMatters:
      "Pricing is simultaneously the most impactful and least scientific major decision in business. Price too low and you leave money on the table while signaling low quality; too high and you stall adoption. Most startups underprice dramatically.",
    example:
      "Strategies include value-based (charge by outcome), cost-plus (add margin), competitive (match market), penetration (start low, raise later), tiered (Good/Better/Best anchoring upsells).",
    keyPoints: [
      "Value-based pricing captures willingness-to-pay, not just costs",
      "Pricing power (ability to raise prices without churn) signals moats",
      "Annual plans improve cash flow and reduce churn simultaneously",
    ],
    related: ["business-models", "gross-profit", "cac"],
  },
  {
    slug: "kpis",
    name: "KPIs",
    category: "Metrics",
    tagline: "Key numbers a team watches to know if it's winning.",
    simpleDefinition:
      "KPIs (Key Performance Indicators) are the handful of chosen metrics representing success for a company or team.",
    whyItMatters:
      "You can't manage what you don't measure, but you also can't measure everything. KPIs force prioritization of attention. Every role has associated KPIs — knowing them tells you what your boss's boss reads on Monday mornings.",
    example:
      "SaaS KPIs: ARR growth, churn, NRR. E-commerce: conversion rate, average order value, CAC. Support: response time, CSAT, tickets resolved.",
    keyPoints: [
      "Leading indicators predict; lagging indicators confirm",
      "Pair opposing metrics to prevent gaming (speed+quality)",
      "Vanity metrics look good but don't drive decisions",
    ],
    related: ["okrs", "north-star-metric"],
  },
  {
    slug: "okrs",
    name: "OKRs",
    category: "Metrics",
    tagline: "Goal-setting framework connecting ambition to action.",
    simpleDefinition:
      "OKRs (Objectives and Key Results) set a qualitative goal (Objective) measured by 3–5 quantified outcomes (Key Results) each quarter.",
    whyItMatters:
      "OKRs align hundreds of people on what matters most without micromanaging how. Google, Intel, and thousands of companies use some version. Understanding OKR vocabulary helps you navigate planning season regardless of employer.",
    example:
      "Objective: 'Deliver an outstanding onboarding experience.' Key Results: activation rate 40%→60%; time-to-first-value <1 day; NPS among new users >50.",
    keyPoints: [
      "Objectives inspire; Key Results measure — never confuse them",
      "Good OKRs are few (3 max), ambitious (~70% attainment is fine)",
      "OKRs ≠ performance reviews, or people sandbag goals",
    ],
    related: ["kpis"],
  },
  {
    slug: "roi",
    name: "ROI",
    category: "Metrics",
    tagline: "Return on Investment — was it worth it?",
    simpleDefinition:
      "ROI measures gain versus cost of an investment: (gain − cost) ÷ cost, expressed as a percentage.",
    whyItMatters:
      "ROI is the universal justification language inside companies. Budget requests, marketing campaigns, new hires — everything competes through ROI math. Speaking fluently ('this tool costs $10K but saves 200 hours ≈ $15K') makes you credible instantly.",
    example:
      "Spend $10,000 on ads generating $35,000 of gross profit → ROI = (35K−10K)/10K = 250%.",
    keyPoints: [
      "Simple formula hides tricky inputs (attribution, timeframes)",
      "Compare against opportunity cost — the next-best alternative",
      "Some investments (brand, research) resist ROI measurement yet matter",
    ],
    related: ["cac", "ltv"],
  },
  {
    slug: "cac",
    name: "CAC",
    category: "Metrics",
    tagline: "Customer Acquisition Cost — price of winning one customer.",
    simpleDefinition:
      "CAC is the average total sales+marketing spend required to acquire one new customer.",
    whyItMatters:
      "CAC anchors go-to-market economics. Compare against LTV: acquiring $1,000-LTV customers for $4,000 is a losing machine no matter how impressive growth looks. Boards scrutinize CAC trends because rising CAC often signals saturating markets.",
    example:
      "$200K spent on sales+marketing in Q1 acquired 80 customers → blended CAC = $2,500. Enterprise segment alone might show $8,000 CAC — segmentation matters.",
    keyPoints: [
      "Blended CAC mixes channels; paid CAC isolates specific ones",
      "Payback period: months until customer revenue repays CAC (<18mo healthy)",
      "Organic/viral acquisition lowers blended CAC over time",
    ],
    related: ["ltv", "roi", "pricing"],
  },
  {
    slug: "ltv",
    name: "LTV",
    category: "Metrics",
    tagline: "Lifetime Value — total worth of one customer relationship.",
    simpleDefinition:
      "LTV estimates the total profit (not just revenue) a customer generates across their entire relationship with the company.",
    whyItMatters:
      "LTV reframes customers as assets rather than transactions. High LTV justifies aggressive acquisition spending, generous service, and patience with early losses. The LTV:CAC ratio (target ≥3:1) is the single most-cited health metric in subscriptions.",
    example:
      "Average customer pays $50/month for 24 months at 80% gross margin → LTV = 50 × 24 × 0.8 = $960. Against $300 CAC, that's a healthy 3.2×.",
    keyPoints: [
      "Retention improvements multiply LTV non-linearly",
      "Use margin-based LTV, not revenue-based, for honest math",
      "Segment LTV — averages hide that enterprise >> self-serve often",
    ],
    related: ["cac", "churn", "mrr"],
  },
  {
    slug: "arr",
    name: "ARR",
    category: "Money In",
    tagline: "Annual Recurring Revenue — the SaaS headline number.",
    simpleDefinition:
      "ARR is the yearly value of all active recurring subscriptions, normalized: monthly recurring revenue × 12.",
    whyItMatters:
      "ARR is THE valuation anchor for subscription companies — investors price firms at ARR multiples. It strips out one-time fees and focuses attention on durable, repeatable income. Growth rate plus ARR roughly determines fundraising prospects.",
    example:
      "150 customers paying $800/month average → MRR $120K → ARR $1.44M. Add $100K annual contracts signed mid-year proportionally.",
    keyPoints: [
      "Only committed recurring contracts count; usage spikes don't",
      "ARR movements decompose into: new + expansion − contraction − churn",
      "NRR >110% means existing customers alone grow ARR meaningfully",
    ],
    related: ["mrr", "churn", "revenue"],
  },
  {
    slug: "mrr",
    name: "MRR",
    category: "Money In",
    tagline: "Monthly Recurring Revenue — the monthly heartbeat.",
    simpleDefinition:
      "MRR is the monthly normalized value of active subscriptions — the month-scale sibling of ARR.",
    whyItMatters:
      "MRR moves faster than ARR, making it the operational pulse teams check weekly. Its components tell precise stories: New MRR (sales motion), Expansion (CS effectiveness), Churned (product problems).",
    example:
      "Start January at $100K MRR: add $12K new, $3K expansion, lose $5K churned → February opens at $110K. Net growth $10K = 10% MoM.",
    keyPoints: [
      "ARR = MRR × 12 always, in clean definitions",
      "Expansion MRR from upsells is cheapest growth available",
      "Quick ratio (new+expansion)/(churn+contraction) measures momentum quality",
    ],
    related: ["arr", "churn", "revenue"],
  },
  {
    slug: "burn-rate",
    name: "Burn Rate",
    category: "Money Out",
    tagline: "How fast cash leaves the building monthly.",
    simpleDefinition:
      "Burn rate is net cash lost per month (spending exceeding income), typically stated for venture-backed or loss-making companies.",
    whyItMatters:
      "Burn determines survival arithmetic combined with bank balance. Investors tolerate burn buying growth; markets punish undisciplined burn. When funding environments tighten, 'extend runway' becomes the whole company strategy overnight.",
    example:
      "Bank holds $6M. Monthly: $900K out, $650K in → net burn $250K/month. Runway = 6M ÷ 250K = 24 months.",
    keyPoints: [
      "Gross burn (all outflows) vs net burn (outflows − inflows)",
      "Growth efficiency: burn multiple = net burn ÷ net new ARR (<2 good)",
      "Default-alive vs default-dead framing clarifies strategy honestly",
    ],
    related: ["runway", "cash-flow", "costs"],
  },
  {
    slug: "runway",
    name: "Runway",
    category: "Money Out",
    tagline: "Months until the money runs out.",
    simpleDefinition:
      "Runway is how many months the company can operate at current burn before cash hits zero: cash balance ÷ net monthly burn.",
    whyItMatters:
      "Runway converts abstract finances into urgent time pressure. Below ~12 months, hiring freezes appear; below 6, emergency measures begin. Founders raise preemptively partly to keep runway comfortably above danger zones.",
    example:
      "$1.5M cash, $125K monthly burn → 12-month runway. Cutting burn to $90K extends runway to nearly 17 months without earning a dollar more.",
    keyPoints: [
      "Both levers extend runway: cut burn OR increase revenue",
      "Fundraising itself takes 3–6 months — start before desperation",
      "Revenue-funded companies track runway less; profitable ones not at all",
    ],
    related: ["burn-rate", "cash-flow"],
  },
];

export const fundamentalBySlug = (slug: string) =>
  fundamentals.find((f) => f.slug === slug);

export const fundamentalCategories: Fundamental["category"][] = [
  "Money In",
  "Money Out",
  "Profit & Cash",
  "Metrics",
  "Strategy",
];
