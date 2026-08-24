import type { Department } from "./types";

export const departments: Department[] = [
  {
    slug: "executive",
    name: "Executive",
    monogram: "EX",
    accent:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-indigo-500/20",
    group: "Leadership",
    tagline: "Sets direction, allocates resources, owns the big decisions.",
    whatItDoes: [
      "The executive team — the CEO and C-level officers — decides where the company is going and how it will get there. They set strategy, allocate budget across teams, hire or remove senior leaders, and represent the company to the board, investors, press, and major customers.",
      "Executives are the only people whose job is to see the whole company at once. Every other department optimizes its own area; executives balance trade-offs between them.",
    ],
    whyItExists: [
      "Someone must resolve conflicts between departments — Sales wants more headcount, Finance wants lower costs.",
      "Investors and boards require a single accountable point of leadership.",
      "Long-term bets (new markets, acquisitions, pivots) need owners who think in years, not sprints.",
    ],
    responsibilities: [
      "Define company vision, mission, and multi-year strategy",
      "Allocate capital and headcount across departments",
      "Hire, evaluate, and replace senior leadership",
      "Report results to the board and investors",
      "Represent the company publicly — customers, partners, media, regulators",
      "Make final calls on major, hard-to-reverse decisions",
      "Shape culture through what they reward, tolerate, and punish",
    ],
    roles: [
      {
        title: "CEO (Chief Executive Officer)",
        description:
          "Top decision-maker. Owns overall strategy, the executive team, and results reported to the board.",
      },
      {
        title: "COO (Chief Operating Officer)",
        description:
          "Runs day-to-day operations so the CEO can focus outward on strategy and stakeholders.",
      },
      {
        title: "CFO / CTO / CMO / CHRO / CRO",
        description:
          "Functional chiefs who lead Finance, Technology, Marketing, HR, and Revenue respectively — each also a member of the executive team.",
      },
      {
        title: "Chief of Staff",
        description:
          "Extends executive bandwidth: coordinates priorities, follows up on initiatives, prepares decisions.",
      },
    ],
    kpis: [
      {
        name: "Revenue growth",
        description: "Year-over-year top-line expansion versus plan.",
      },
      {
        name: "Profitability / EBITDA margin",
        description: "How much of each revenue dollar survives all costs.",
      },
      {
        name: "Strategic goal completion",
        description: "Progress against the 3–5 company-level objectives for the year.",
      },
      {
        name: "Shareholder value",
        description:
          "Stock price or valuation trend — the market's verdict on execution.",
      },
    ],
    terminology: [
      {
        term: "Board of Directors",
        definition:
          "Elected representatives of shareholders who hire/fire the CEO and approve major decisions.",
      },
      {
        term: "OKR",
        definition:
          "Objectives and Key Results — a goal-setting framework linking company goals to team targets.",
      },
      {
        term: "Town hall",
        definition:
          "All-company meeting where leadership shares updates and answers questions.",
      },
      {
        term: "Offsite",
        definition:
          "Dedicated strategy session away from daily operations, usually quarterly or annual.",
      },
    ],
    worksWith: [
      { department: "Everyone", how: "Sets targets that cascade into every department's plans." },
      { department: "Board & Investors", how: "Reports performance; seeks approval for major moves." },
      { department: "Finance", how: "Builds budgets and forecasts that translate strategy into numbers." },
    ],
    workflow: [
      {
        step: "Annual planning",
        detail:
          "Executive team agrees on 3–5 company objectives and a rough budget envelope per department.",
      },
      {
        step: "Cascade",
        detail:
          "Each department translates company objectives into its own OKRs and headcount requests.",
      },
      {
        step: "Quarterly review",
        detail:
          "Leadership reviews KPIs, reallocates resources, kills what isn't working.",
      },
      {
        step: "Board update",
        detail:
          "CEO presents results, risks, and asks; board advises and approves big items.",
      },
    ],
  },
  {
    slug: "finance",
    name: "Finance",
    monogram: "FI",
    accent:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
    group: "Business",
    tagline: "Tracks every dollar in, every dollar out — and predicts both.",
    whatItDoes: [
      "Finance manages the company's money: recording what happened (accounting), predicting what will happen (FP&A), and making sure cash never runs out (treasury). It produces the financial statements leadership uses to steer and investors use to judge.",
      "If the company is a car, Finance is the dashboard and fuel system combined — it tells you how fast you're going, how much fuel remains, and warns before the engine dies.",
    ],
    whyItExists: [
      "Companies legally must keep accurate books and pay taxes correctly.",
      "Decisions like hiring, pricing, or expansion need financial analysis before commitment.",
      "Running out of cash kills companies faster than any competitor does.",
    ],
    responsibilities: [
      "Bookkeeping and accurate monthly/quarterly/annual closes",
      "Producing financial statements: P&L, balance sheet, cash flow statement",
      "Budgeting and reforecasting; variance analysis versus plan",
      "Managing cash: collections, payments, banking relationships, credit lines",
      "Payroll coordination, taxes, audits, and statutory compliance",
      "Deal support: pricing analysis, fundraising, M&A evaluation",
    ],
    roles: [
      {
        title: "CFO (Chief Financial Officer)",
        description:
          "Owns financial strategy, investor relations, and the finance org.",
      },
      {
        title: "Controller",
        description:
          "Owns accounting accuracy: the books, closes, audits, and reporting rules.",
      },
      {
        title: "FP&A Analyst",
        description:
          "Builds budgets and forecasts; explains variances between plan and reality.",
      },
      {
        title: "Accountant / Bookkeeper",
        description:
          "Records transactions, reconciles accounts, processes invoices and expenses.",
      },
      {
        title: "Treasury / AP-AR Specialist",
        description:
          "Manages cash flow: pays vendors (AP), collects from customers (AR).",
      },
    ],
    kpis: [
      { name: "Cash runway", description: "Months until cash runs out at current burn." },
      { name: "Gross & net margin", description: "Profit retained per revenue dollar." },
      { name: "Days Sales Outstanding (DSO)", description: "Average days to collect payment after invoicing." },
      { name: "Forecast accuracy", description: "How close projections land versus actuals." },
      { name: "Close time", description: "Days needed to finalize monthly books — speed signals health." },
    ],
    terminology: [
      { term: "P&L (Income Statement)", definition: "Revenue minus costs over a period = profit or loss." },
      { term: "Balance Sheet", definition: "Snapshot of assets, liabilities, and equity at one date." },
      { term: "Cash Flow Statement", definition: "Where actual cash came from and went during a period." },
      { term: "Accrual accounting", definition: "Recording revenue when earned and costs when incurred, not when cash moves." },
      { term: "CapEx vs OpEx", definition: "Capital expenditure buys lasting assets; operating expense is consumed within the year." },
      { term: "Audit", definition: "Independent examination of the books to verify accuracy." },
    ],
    worksWith: [
      { department: "Every department", how: "Approves budgets, processes payments, reports their spending." },
      { department: "Sales", how: "Checks deal economics; chases unpaid invoices together." },
      { department: "Executive", how: "Provides the numbers behind strategic decisions." },
      { department: "Legal", how: "Coordinates contracts terms affecting revenue recognition and taxes." },
    ],
    workflow: [
      { step: "Monthly close", detail: "Record all transactions, reconcile bank accounts, lock the books." },
      { step: "Variance analysis", detail: "Compare actuals to budget; explain every significant gap." },
      { step: "Rolling forecast", detail: "Update the 12-month projection with new information." },
      { step: "Reporting", detail: "Publish dashboards and statements for leadership and investors." },
      { step: "Cash management", detail: "Chase receivables, schedule payables, keep buffer reserves healthy." },
    ],
  },
  {
    slug: "sales",
    name: "Sales",
    monogram: "SA",
    accent:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/20",
    group: "Business",
    tagline: "Turns strangers into paying customers, pipeline into revenue.",
    whatItDoes: [
      "Sales finds people and companies with a problem the product solves, convinces them to buy, and closes contracts. It converts marketing-generated interest into signed deals — the moment money enters the machine.",
      "Sales teams live in a CRM, work from quotas, and measure everything in pipeline stages. In B2B, a single deal can involve months of demos, negotiations, and procurement paperwork.",
    ],
    whyItExists: [
      "Complex or expensive products don't sell themselves; someone must build trust and navigate the buyer's organization.",
      "Revenue is oxygen — sales directly controls its inflow.",
      "Salespeople carry market truth back inside: objections, competitor moves, feature gaps.",
    ],
    responsibilities: [
      "Prospecting and qualifying potential customers (leads)",
      "Running discovery calls and product demonstrations",
      "Writing proposals and negotiating pricing and contract terms",
      "Closing deals and handing off to implementation/CS smoothly",
      "Maintaining accurate CRM records and pipeline forecasts",
      "Feeding competitive intel and customer feedback back to product/marketing",
    ],
    roles: [
      {
        title: "CRO / VP of Sales",
        description: "Owns the revenue number, team structure, and go-to-market strategy.",
      },
      {
        title: "SDR / BDR",
        description:
          "Sales/Business Development Reps — junior hunters who prospect and book meetings for AEs.",
      },
      {
        title: "Account Executive (AE)",
        description: "Runs deals end-to-end: demo, negotiation, close. Carries the quota.",
      },
      {
        title: "Account Manager",
        description: "Grows existing accounts post-sale: renewals, upsells, satisfaction.",
      },
      {
        title: "Sales Engineer",
        description: "Technical expert who joins calls to answer deep product questions.",
      },
      {
        title: "Sales Ops",
        description: "Builds the machinery: CRM hygiene, territories, comp plans, analytics.",
      },
    ],
    kpis: [
      { name: "Quota attainment", description: "% of individual/team revenue target achieved." },
      { name: "Win rate", description: "Deals won ÷ deals worked — quality of targeting and selling." },
      { name: "Pipeline coverage", description: "Pipeline value ÷ quota; 3–4× is the classic healthy ratio." },
      { name: "ACV (Average Contract Value)", description: "Typical annual size of a closed deal." },
      { name: "Sales cycle length", description: "Days from first meeting to signature." },
    ],
    terminology: [
      { term: "Pipeline", definition: "All active deals at various stages toward closing." },
      { term: "Lead / Prospect", definition: "Potential buyer identified but unqualified / engaged and qualified." },
      { term: "Quota", definition: "The revenue number an AE must close per period." },
      { term: "CRM", definition: "Customer Relationship Management software — the sales database (e.g., Salesforce)." },
      { term: "Close Won / Lost", definition: "Final statuses when a deal ends its cycle." },
      { term: "Discovery call", definition: "First substantive conversation exploring the prospect's needs." },
    ],
    worksWith: [
      { department: "Marketing", how: "Receives leads; returns feedback on which campaigns convert." },
      { department: "Product", how: "Requests features blocking deals; previews roadmap with prospects carefully." },
      { department: "Customer Success", how: "Hands off signed customers with context and promises made." },
      { department: "Finance", how: "Aligns on pricing floors, discounts, and payment terms." },
      { department: "Legal", how: "Navigates contract redlines and compliance clauses." },
    ],
    workflow: [
      { step: "Prospect", detail: "SDRs research and outreach via email/calls/social to book meetings." },
      { step: "Qualify", detail: "AE checks fit: budget, authority, need, timeline (BANT-style)." },
      { step: "Demo & proposal", detail: "Tailored demonstration followed by a written offer." },
      { step: "Negotiate", detail: "Pricing, legal, security reviews bounce between teams — often the longest stage." },
      { step: "Close", detail: "Signature triggers invoicing by Finance and handoff to CS." },
      { step: "Expand", detail: "Account Managers grow usage and renewals year over year." },
    ],
  },
  {
    slug: "marketing",
    name: "Marketing",
    monogram: "MK",
    accent:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20",
    group: "Business",
    tagline: "Creates demand before sales ever makes a call.",
    whatItDoes: [
      "Marketing shapes how the market perceives the company and fills the funnel with interested buyers. It defines positioning (why us?), tells the story consistently across channels, runs campaigns that generate leads, and equips Sales with materials that convert.",
      "Good marketing means the right people already trust you before the first conversation — lowering sales costs and shortening cycles.",
    ],
    whyItExists: [
      "Customers can't buy what they've never heard of or don't understand.",
      "Brand and reputation compound: strong brands win deals at lower cost for decades.",
      "Demand must be manufactured systematically, not left to luck.",
    ],
    responsibilities: [
      "Positioning, messaging, and brand identity",
      "Website, content, SEO, and thought leadership",
      "Paid advertising and campaign management across channels",
      "Lead generation, nurture programs, and event/webinar marketing",
      "Product launches and sales enablement materials",
      "Market research and competitor monitoring",
    ],
    roles: [
      {
        title: "CMO (Chief Marketing Officer)",
        description: "Owns brand, demand generation, and marketing ROI.",
      },
      {
        title: "Performance / Growth Marketer",
        description: "Runs paid ads and experiments; lives in conversion metrics.",
      },
      {
        title: "Content Marketer",
        description: "Produces articles, guides, videos that attract organic traffic.",
      },
      {
        title: "Product Marketer",
        description: "Translates features into messaging; owns launches and battlecards.",
      },
      {
        title: "Brand / Visual Designer",
        description: "Keeps every touchpoint visually consistent and credible.",
      },
      {
        title: "SEO Specialist / Marketing Ops",
        description: "Owns search visibility and the marketing tech stack + attribution data.",
      },
    ],
    kpis: [
      { name: "MQLs (Marketing Qualified Leads)", description: "Leads deemed worth sales attention." },
      { name: "CAC contribution", description: "Marketing spend per acquired customer." },
      { name: "Conversion rates", description: "Visitor→lead→opportunity at each funnel stage." },
      { name: "Organic traffic", description: "Search-driven visitors — compounding, near-free demand." },
      { name: "Pipeline sourced", description: "Deal value originating from marketing efforts." },
    ],
    terminology: [
      { term: "Funnel", definition: "Awareness → interest → consideration → purchase journey model." },
      { term: "Campaign", definition: "Coordinated push across channels around one offer or story." },
      { term: "MQL / SQL", definition: "Lead stages: qualified by marketing, then accepted by sales." },
      { term: "Positioning", definition: "The deliberate place you occupy in customers' minds versus alternatives." },
      { term: "SEO", definition: "Optimizing content to rank in search engines." },
      { term: "A/B test", definition: "Comparing two variants statistically to pick the winner." },
    ],
    worksWith: [
      { department: "Sales", how: "Supplies leads and collateral; tunes messaging from lost-deal insights." },
      { department: "Product", how: "Plans launches together; feeds user research and market trends." },
      { department: "Finance", how: "Defends budgets with attribution and ROI analysis." },
      { department: "Customer Success", how: "Aligns external promises with delivered experience." },
    ],
    workflow: [
      { step: "Research", detail: "Interview customers, analyze competitors, find positioning gaps." },
      { step: "Message & assets", detail: "Craft core narrative; build site pages, decks, one-pagers." },
      { step: "Launch channels", detail: "Run SEO, paid ads, events, and content in coordinated waves." },
      { step: "Nurture", detail: "Email sequences and retargeting warm leads until sales-ready." },
      { step: "Measure & iterate", detail: "Review channel ROI monthly; kill losers, double winners." },
    ],
  },
  {
    slug: "human-resources",
    name: "Human Resources",
    monogram: "HR",
    accent:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/20",
    group: "People & Support",
    tagline: "Finds, keeps, and grows the people who are the company.",
    whatItDoes: [
      "HR (often rebranded 'People') owns the employee lifecycle: attracting talent, onboarding, developing skills, managing performance, administering benefits and payroll inputs, handling disputes, and offboarding gracefully.",
      "Modern HR balances two mandates that sometimes conflict: protecting the company (compliance, consistency) and advocating for employees (fairness, wellbeing). The best teams refuse to choose.",
    ],
    whyItExists: [
      "Hiring well is the highest-leverage activity in any company and needs dedicated expertise.",
      "Employment law is complex; mistakes create lawsuits and reputational damage.",
      "Culture and career development need intentional ownership or they decay by default.",
    ],
    responsibilities: [
      "Recruiting: sourcing, interviewing coordination, offers",
      "Onboarding new hires productively within week one",
      "Performance review cycles and promotion frameworks",
      "Compensation benchmarks, salary bands, equity refreshers",
      "Benefits administration and payroll coordination with Finance",
      "Policy, compliance, and sensitive investigations",
      "Learning & development programs and manager training",
    ],
    roles: [
      {
        title: "CHRO / Head of People",
        description: "Owns people strategy aligned with business goals.",
      },
      {
        title: "Recruiter / Talent Acquisition",
        description: "Finds and evaluates candidates; owns candidate experience.",
      },
      {
        title: "HR Business Partner (HRBP)",
        description: "Embedded advisor to specific departments on people matters.",
      },
      {
        title: "Compensation & Benefits Analyst",
        description: "Designs fair pay bands and benefits packages using market data.",
      },
      {
        title: "L&D Specialist",
        description: "Builds training, onboarding curricula, and leadership development.",
      },
    ],
    kpis: [
      { name: "Time to hire", description: "Days from open requisition to acceptance." },
      { name: "Offer acceptance rate", description: "Competitiveness of offers extended." },
      { name: "Voluntary turnover / retention", description: "Who leaves, especially regretted losses." },
      { name: "eNPS (employee Net Promoter Score)", description: "Would employees recommend working here?" },
      { name: "Time to productivity", description: "Speed from start date to full contribution." },
    ],
    terminology: [
      { term: "Headcount plan", definition: "Approved list of positions allowed to hire this year." },
      { term: "Onboarding", definition: "Structured first weeks integrating a new hire." },
      { term: "Attrition", definition: "Employees leaving voluntarily or involuntarily over time." },
      { term: "Performance review / PIP", definition: "Formal assessment cycle / Performance Improvement Plan for struggling employees." },
      { term: "Total compensation", definition: "Salary + bonus + equity + benefits value." },
    ],
    worksWith: [
      { department: "Every department", how: "Recruits for them, coaches their managers, resolves escalations." },
      { department: "Finance", how: "Runs payroll jointly; aligns comp budgets with affordability." },
      { department: "Legal", how: "Ensures policies comply with labor law; handles disputes." },
      { department: "Executive", how: "Advises on org design, succession, and layoffs." },
    ],
    workflow: [
      { step: "Requisition", detail: "Department justifies opening; HR validates against headcount plan." },
      { step: "Source & screen", detail: "Post role, review applications, phone-screen candidates." },
      { step: "Loop interviews", detail: "Coordinate panel covering skills, values, and practical exercises." },
      { step: "Offer", detail: "Calibrate level and comp; extend; negotiate; close." },
      { step: "Onboard", detail: "Equipment, accounts, buddy assignment, 30/60/90-day goals." },
      { step: "Grow & retain", detail: "Reviews, promotions, development paths; exit interviews when leaving." },
    ],
  },
  {
    slug: "operations",
    name: "Operations",
    monogram: "OP",
    accent:
      "bg-orange-500/10 text-orange-700 dark:text-orange-300 ring-orange-500/20",
    group: "Business",
    tagline: "Makes the whole machine run reliably, efficiently, repeatedly.",
    whatItDoes: [
      "Operations turns plans into dependable execution. Depending on the industry this means manufacturing and supply chains, service delivery, logistics, facilities — and everywhere it means designing processes, removing bottlenecks, and ensuring quality at scale.",
      "Ops thinks in systems: if something happens more than twice, it deserves a documented process, an owner, and a metric.",
    ],
    whyItExists: [
      "Growth breaks informal habits; processes must scale deliberately.",
      "Reliability is a product feature — late shipments or outages destroy trust quickly.",
      "Small efficiency gains compound enormously across thousands of repetitions.",
    ],
    responsibilities: [
      "Designing and documenting standard operating procedures (SOPs)",
      "Supply chain, inventory, and vendor logistics management",
      "Quality assurance and error-rate reduction",
      "Capacity planning: matching demand with resources",
      "Facilities, office management, and internal tooling oversight",
      "Continuous improvement programs (lean, six sigma)",
    ],
    roles: [
      {
        title: "COO (Chief Operating Officer)",
        description: "Second-in-command in many firms; owns execution company-wide.",
      },
      {
        title: "Operations Manager",
        description: "Runs daily output for a region/site/function against KPIs.",
      },
      {
        title: "Supply Chain Manager",
        description: "Coordinates suppliers, production schedules, and distribution.",
      },
      {
        title: "Process Improvement Lead",
        description: "Maps workflows, finds bottlenecks, implements fixes.",
      },
      {
        title: "QA / Logistics Coordinator",
        description: "Inspects quality; orchestrates movement of goods and people.",
      },
    ],
    kpis: [
      { name: "Cycle time", description: "Duration from order/start to completion." },
      { name: "Cost per unit / per ticket", description: "Efficiency of producing output." },
      { name: "Defect/error rate", description: "Percentage of outputs failing standards." },
      { name: "On-time delivery", description: "Promises kept, as a percentage." },
      { name: "Capacity utilization", description: "How much available capacity is productively used." },
    ],
    terminology: [
      { term: "SOP", definition: "Standard Operating Procedure — documented 'how we do X here'." },
      { term: "SLA", definition: "Service Level Agreement — promised response/resolution times." },
      { term: "Bottleneck", definition: "The slowest stage capping total throughput." },
      { term: "Lean / Kaizen", definition: "Philosophies of eliminating waste and continuous small improvements." },
      { term: "Throughput", definition: "Units processed per time period." },
    ],
    worksWith: [
      { department: "Product/Engineering", how: "Productionizes what they build; flags operational constraints early." },
      { department: "Finance", how: "Justifies efficiency investments with cost-benefit math." },
      { department: "Procurement", how: "Specifies supplier requirements and evaluates performance." },
      { department: "Customer Success", how: "Aligns delivery reliability with customer expectations." },
    ],
    workflow: [
      { step: "Map", detail: "Document current process steps, owners, timings honestly." },
      { step: "Measure", detail: "Instrument baseline metrics: time, cost, defects per stage." },
      { step: "Identify bottleneck", detail: "Find the constraint stage limiting overall flow." },
      { step: "Improve", detail: "Redesign, automate, or staff differently around the constraint." },
      { step: "Standardize", detail: "Write SOPs, train everyone, audit adherence." },
      { step: "Monitor", detail: "Dashboards watch for drift; improvement loops restart." },
    ],
  },
  {
    slug: "product",
    name: "Product",
    monogram: "PD",
    accent:
      "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 ring-fuchsia-500/20",
    group: "Technical",
    tagline: "Decides what gets built, for whom, and why it matters.",
    whatItDoes: [
      "Product sits at the intersection of customers, business, and technology. Product managers discover problems worth solving, define requirements, prioritize the backlog against impact and effort, and shepherd features from idea to launch to iteration.",
      "PMs own the 'what' and 'why'; Engineering owns the 'how'. When done well, product work feels like the whole company rowing in the same direction.",
    ],
    whyItExists: [
      "Engineering capacity is finite; someone must choose ruthlessly among infinite ideas.",
      "Customers describe wants, not root needs; translation requires dedicated craft.",
      "Building the wrong thing perfectly wastes more than building anything else badly.",
    ],
    responsibilities: [
      "Customer/user research: interviews, surveys, usage analysis",
      "Roadmap definition and transparent prioritization",
      "Writing specs: problem statements, requirements, success metrics",
      "Working daily with design and engineering through delivery",
      "Go-to-market coordination with marketing/sales for launches",
      "Measuring shipped outcomes; killing or iterating based on data",
    ],
    roles: [
      {
        title: "CPO / Head of Product",
        description: "Owns product vision and strategy across all teams.",
      },
      {
        title: "Product Manager (PM)",
        description: "Mini-CEO of one product area: discovery, prioritization, delivery.",
      },
      {
        title: "Technical PM / Product Owner",
        description: "Deep-integration or platform products; scrum-team backlog owner.",
      },
      {
        title: "UX Researcher",
        description: "Uncovers user behaviors and needs through structured studies.",
      },
      {
        title: "Data/Product Analyst",
        description: "Instruments analytics; answers adoption and behavior questions.",
      },
    ],
    kpis: [
      { name: "Activation rate", description: "% of new users reaching first meaningful value." },
      { name: "Retention/churn curves", description: "Whether users keep coming back month over month." },
      { name: "Feature adoption", description: "Usage of shipped functionality among target users." },
      { name: "Roadmap predictability", description: "Shipped-as-promised rate balancing agility and trust." },
      { name: "North-star metric input", description: "Contribution to the company's headline value metric." },
    ],
    terminology: [
      { term: "Roadmap", definition: "Prioritized, time-horizoned view of planned work." },
      { term: "MVP", definition: "Minimum Viable Product — smallest version that tests the core hypothesis." },
      { term: "Backlog", definition: "Prioritized list of everything potentially to build." },
      { term: "User story", definition: "'As a [user], I want [goal], so that [benefit]' requirement format." },
      { term: "RICE scoring", definition: "Reach × Impact × Confidence ÷ Effort prioritization formula." },
      { term: "Discovery", definition: "Structured exploration of user problems before committing to build." },
    ],
    worksWith: [
      { department: "Engineering", how: "Daily pairing on scope, feasibility, trade-offs, and launch readiness." },
      { department: "Design", how: "Co-owns user flows and prototypes from concept onward." },
      { department: "Sales & Marketing", how: "Positions launches; gathers field evidence and competitive gaps." },
      { department: "Customer Success", how: "Mines support tickets and QBR notes for pain-point patterns." },
      { department: "Finance", how: "Builds business cases quantifying expected impact." },
    ],
    workflow: [
      { step: "Discover", detail: "Interview users, mine data, quantify the problem's size." },
      { step: "Frame", detail: "Write problem spec: who hurts, how much, why now, success metric." },
      { step: "Prioritize", detail: "Score against alternatives; secure stakeholder alignment on the roadmap." },
      { step: "Build iteratively", detail: "Specs → prototypes → MVP; weekly scope-trimming with engineering." },
      { step: "Launch & learn", detail: "Ship behind flags, monitor metrics, run follow-up experiments." },
    ],
  },
  {
    slug: "engineering",
    name: "Engineering",
    monogram: "EN",
    accent:
      "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/20",
    group: "Technical",
    tagline: "Designs, builds, and runs the technology the business stands on.",
    whatItDoes: [
      "Engineering converts product intent into working software (or hardware): architecting systems, writing code, testing, deploying, and keeping everything running reliably afterward.",
      "Modern engineering is judged not just by what ships but how safely it ships — deployment frequency, incident rates, and recovery speed matter as much as features.",
    ],
    whyItExists: [
      "Software now is the business in most industries, not just a support function.",
      "Technology decisions create decade-long leverage or debt.",
      "Uptime and security failures carry direct financial and legal consequences.",
    ],
    responsibilities: [
      "System architecture and technology selection",
      "Feature implementation, code review, testing",
      "Deployment pipelines and release management",
      "Production monitoring, incident response, on-call rotations",
      "Security hardening and vulnerability patching",
      "Managing technical debt deliberately rather than accidentally",
    ],
    roles: [
      {
        title: "CTO (Chief Technology Officer)",
        description: "Owns technical vision, architecture direction, engineering org.",
      },
      {
        title: "Software Engineer (Junior → Principal)",
        description: "IC ladder from guided tasks to company-shaping architectural influence.",
      },
      {
        title: "Tech Lead",
        description: "IC who owns technical decisions and mentorship for a team.",
      },
      {
        title: "DevOps / SRE",
        description: "Builds deployment infrastructure; keeps uptime promises; carries pagers.",
      },
      {
        title: "QA Engineer",
        description: "Designs automated and exploratory test strategies.",
      },
      {
        title: "Security Engineer",
        description: "Threat-models, pentests, enforces secure coding practices.",
      },
    ],
    kpis: [
      { name: "Deployment frequency", description: "How often code ships — proxy for flow health." },
      { name: "Change failure rate", description: "% of deployments causing incidents." },
      { name: "Uptime / availability", description: "System accessibility percentage (99.9% etc.)." },
      { name: "Mean time to recovery", description: "Minutes/hours to restore service after failure." },
      { name: "Cycle time", description: "Days from 'start building' to 'running in production'." },
    ],
    terminology: [
      { term: "Sprint", definition: "Fixed 1–4 week development cycle with committed scope." },
      { term: "CI/CD", definition: "Automated pipelines testing and releasing every change." },
      { term: "Tech debt", definition: "Accumulated shortcuts costing future velocity." },
      { term: "API", definition: "Contract allowing software systems to talk programmatically." },
      { term: "Incident / Postmortem", definition: "Outage event / blameless analysis preventing repeats." },
      { term: "Code review", definition: "Peer inspection gate before merging changes." },
    ],
    worksWith: [
      { department: "Product", how: "Estimates, builds, and ships together; negotiates scope daily." },
      { department: "IT", how: "Shares tooling and identity infrastructure; distinct missions though." },
      { department: "Security/Legal", how: "Implements privacy and compliance requirements technically." },
      { department: "Customer Success", how: "Fixes escalated bugs; engineers join critical customer calls occasionally." },
    ],
    workflow: [
      { step: "Refine", detail: "Break down upcoming work with PM; estimate complexity honestly." },
      { step: "Branch & build", detail: "Implement in small branches with tests written alongside." },
      { step: "Review & merge", detail: "Peers inspect code; CI runs automated checks; merge to main." },
      { step: "Deploy gradually", detail: "Canary releases to small % traffic before full rollout." },
      { step: "Operate", detail: "Dashboards and alerts; on-call responds; blameless postmortems after incidents." },
    ],
  },
  {
    slug: "it",
    name: "IT",
    monogram: "IT",
    accent:
      "bg-teal-500/10 text-teal-700 dark:text-teal-300 ring-teal-500/20",
    group: "Technical",
    tagline: "Keeps employees productive: laptops, access, networks, tools.",
    whatItDoes: [
      "IT serves the internal company, unlike Engineering which serves customers. IT provisions laptops and accounts, maintains networks and office tech, manages the SaaS stack and licenses, enforces device security, and rescues anyone locked out minutes before a client call.",
      "When IT works, nobody notices — invisibility is the success metric.",
    ],
    whyItExists: [
      "Hundreds of employees need reliable hardware, access, and connectivity daily.",
      "SaaS sprawl requires governance: licenses, renewals, data boundaries.",
      "Security starts at endpoints; one compromised laptop endangers everything.",
    ],
    responsibilities: [
      "Device provisioning, lifecycle, and repairs",
      "Identity and access management (SSO, MFA, permissions)",
      "Network, VPN, and office infrastructure",
      "SaaS application administration and license optimization",
      "Endpoint security policy, patching, phishing defense",
      "Help desk support with SLA-backed response times",
    ],
    roles: [
      {
        title: "IT Director / Manager",
        description: "Owns internal tech strategy, budgets, vendor relationships.",
      },
      {
        title: "Sysadmin / Infrastructure Admin",
        description: "Runs servers, cloud workspaces, directory services.",
      },
      {
        title: "Help Desk Technician",
        description: "Frontline support resolving tickets and walk-ups.",
      },
      {
        title: "IT Security Specialist",
        description: "Endpoint protection, awareness training, incident containment.",
      },
    ],
    kpis: [
      { name: "Ticket resolution time", description: "Speed from report to fix, by severity tier." },
      { name: "Employee satisfaction (CSAT)", description: "Internal rating of support interactions." },
      { name: "Onboarding/offboarding time", description: "Hours to fully provision or deprovision a person." },
      { name: "License utilization", description: "Paid seats actually in use — waste detection." },
      { name: "Security incidents", description: "Count and severity of breaches/near-misses." },
    ],
    terminology: [
      { term: "SSO", definition: "Single Sign-On — one login granting access to many tools." },
      { term: "MFA", definition: "Multi-Factor Authentication — password plus second proof of identity." },
      { term: "MDM", definition: "Mobile Device Management — centralized control of company devices." },
      { term: "Provisioning", definition: "Full setup of accounts, hardware, and access for a new hire." },
      { term: "SLA", definition: "Promised maximum response/resolution times per issue class." },
    ],
    worksWith: [
      { department: "HR", how: "Day-one provisioning triggered by hiring milestones automatically." },
      { department: "Finance", how: "Manages license renewals; fights shadow-IT spending." },
      { department: "Engineering", how: "Separates concerns but coordinates on identity and network." },
      { department: "Legal", how: "Enforces data-retention and privacy configurations." },
    ],
    workflow: [
      { step: "Request intake", detail: "Ticket created via portal, chat bot, or email auto-triage." },
      { step: "Triage & prioritize", detail: "Severity assigned: outage > blocked worker > annoyance." },
      { step: "Resolve", detail: "Knowledge-base fix, remote session, or hardware swap." },
      { step: "Verify & document", detail: "Confirm fixed with requester; update knowledge base article." },
      { step: "Analyze patterns", detail: "Monthly review of recurring issues drives systemic fixes." },
    ],
  },
  {
    slug: "customer-success",
    name: "Customer Success",
    monogram: "CS",
    accent:
      "bg-lime-500/10 text-lime-700 dark:text-lime-300 ring-lime-500/20",
    group: "People & Support",
    tagline: "Keeps customers winning after the sale — because renewals fund tomorrow.",
    whatItDoes: [
      "Customer Success ensures buyers achieve the outcome they purchased, not merely the product they received. CS onboards new accounts, monitors usage health, trains champions, defuses escalations, and secures renewals and expansions.",
      "For subscription businesses, CS effectively IS revenue: most future income comes from existing customers deciding to stay and buy more.",
    ],
    whyItExists: [
      "Acquiring a new customer costs multiples of retaining one.",
      "Silent dissatisfaction churns accounts without warning unless someone watches leading indicators.",
      "Happy customers expand spend and refer others — cheapest growth available.",
    ],
    responsibilities: [
      "Onboarding: implementation plans, training, first-value milestones",
      "Monitoring account health scores and usage telemetry",
      "Regular check-ins and Quarterly Business Reviews (QBRs)",
      "Handling escalations and coordinating internal rescue teams",
      "Renewal management and expansion (upsell/cross-sell) opportunities",
      "Voicing customer patterns back to Product and Marketing",
    ],
    roles: [
      {
        title: "VP of Customer Success",
        description: "Owns retention, NRR, and CS org design.",
      },
      {
        title: "Customer Success Manager (CSM)",
        description: "Named owner of account portfolios and their outcomes.",
      },
      {
        title: "Support Agent",
        description: "Reactive troubleshooting via tickets/chat; tiered by complexity.",
      },
      {
        title: "Onboarding / Implementation Specialist",
        description: "Project-manages technical setup for new enterprise customers.",
      },
      {
        title: "Escalation Manager",
        description: "Coordinates all-hands responses when major accounts wobble.",
      },
    ],
    kpis: [
      { name: "Gross churn rate", description: "% ARR lost annually from cancellations/downgrades." },
      { name: "Net Revenue Retention (NRR)", description: "Revenue retained including expansions; >100% means growth without new logos." },
      { name: "Health score coverage", description: "% of accounts with reliable predictive health tracking." },
      { name: "CSAT / NPS", description: "Interaction satisfaction and loyalty likelihood." },
      { name: "Time to first value", description: "Days from signing to customer's first realized outcome." },
    ],
    terminology: [
      { term: "Churn", definition: "Customers or revenue lost over a period." },
      { term: "Renewal", definition: "Contract extension decision point, typically annual." },
      { term: "Upsell / Cross-sell", definition: "More of same product / adjacent product sold to existing customer." },
      { term: "Health score", definition: "Composite signal (usage+support+sentiment) predicting risk." },
      { term: "QBR", definition: "Quarterly Business Review — structured value-demonstration meeting." },
    ],
    worksWith: [
      { department: "Sales", how: "Returns expansion leads; flags risky renewals early." },
      { department: "Product", how: "Delivers ranked friction lists and feature requests with evidence." },
      { department: "Engineering", how: "Escalates bugs; negotiates hotfix timelines." },
      { department: "Finance", how: "Forecasts renewal revenue; validates churn provisions." },
    ],
    workflow: [
      { step: "Kickoff", detail: "Within days of signing: mutual success plan with measurable goals." },
      { step: "Implement", detail: "Technical setup, data migration, admin training completed." },
      { step: "Drive adoption", detail: "Champion enablement; usage monitored against baseline targets." },
      { step: "Review quarterly", detail: "QBR demonstrates ROI; roadmap preview excites; risks surface." },
      { step: "Renew & expand", detail: "Start renewal talks 90+ days early armed with value narrative." },
    ],
  },
  {
    slug: "legal",
    name: "Legal",
    monogram: "LG",
    accent:
      "bg-slate-400/15 text-slate-700 dark:text-slate-300 ring-slate-400/25",
    group: "Business",
    tagline: "Protects the company from risks it doesn't see coming.",
    whatItDoes: [
      "Legal drafts and negotiates contracts, ensures regulatory compliance, protects intellectual property, manages disputes, and advises on everything from hiring terminations to product liability to data privacy.",
      "Lawyers in-house optimize for business enablement: finding the 'yes' structure that lets deals happen safely, rather than reflexively saying no.",
    ],
    whyItExists: [
      "Contracts gone wrong cost multiples of legal fees spent preventing them.",
      "Regulatory penalties (privacy, labor, industry rules) reach existential levels.",
      "IP theft or patent suits can erase entire product lines overnight.",
    ],
    responsibilities: [
      "Drafting and negotiating commercial contracts and NDAs",
      "Corporate governance: entity structure, board minutes, filings",
      "Compliance programs: privacy (GDPR/CCPA), industry regulations",
      "Intellectual property: trademarks, patents, trade secrets",
      "Employment law guidance and dispute resolution",
      "Managing outside counsel and litigation strategy",
    ],
    roles: [
      {
        title: "General Counsel (GC)",
        description: "Top lawyer; advises CEO/board on legal strategy and risk appetite.",
      },
      {
        title: "Corporate Counsel",
        description: "Handles governance, financing documents, M&A support.",
      },
      {
        title: "Commercial Contracts Manager",
        description: "High-volume deal negotiation — the sales team's best friend.",
      },
      {
        title: "Privacy Officer / DPO",
        description: "Owns data-protection compliance and regulator relationships.",
      },
      {
        title: "Compliance Officer",
        description: "Builds training, audits, and controls for regulated activities.",
      },
    ],
    kpis: [
      { name: "Contract turnaround time", description: "Days from request to executed agreement." },
      { name: "Matter resolution cost", description: "Legal spend per dispute/case versus benchmark." },
      { name: "Compliance findings", description: "Audit deficiencies open and aging." },
      { name: "Risk exposure reduction", description: "Quantified liability closed through renegotiations/policies." },
    ],
    terminology: [
      { term: "NDA", definition: "Non-Disclosure Agreement protecting shared confidential info." },
      { term: "Indemnification", definition: "Clause allocating financial responsibility if harms occur." },
      { term: "Liability", definition: "Legal responsibility for debts or damages." },
      { term: "IP (Intellectual Property)", definition: "Ownership rights over creations: patents, marks, code, content." },
      { term: "Force majeure", definition: "Clause excusing performance during extraordinary events." },
      { term: "GDPR", definition: "EU data-protection regulation with global reach and heavy fines." },
    ],
    worksWith: [
      { department: "Sales", how: "Negotiates customer contracts; pre-approves fallback clause positions." },
      { department: "HR", how: "Guides terminations, contracts, harassment investigations." },
      { department: "Product/Engineering", how: "Reviews privacy-by-design, licensing of dependencies." },
      { department: "Finance", how: "Aligns revenue-recognition language; discloses contingencies." },
    ],
    workflow: [
      { step: "Intake", detail: "Request arrives with draft contract and business context." },
      { step: "Risk assess", detail: "Classify exposure: standard paper vs bespoke terms vs high-risk." },
      { step: "Redline & negotiate", detail: "Mark up terms; iterate with counterparty counsel." },
      { step: "Approve & execute", detail: "Signature authority applied per delegation matrix." },
      { step: "Store obligations", detail: "Log key dates, renewal windows, duties into contract system." },
    ],
  },
  {
    slug: "procurement",
    name: "Procurement",
    monogram: "PC",
    accent:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20",
    group: "Business",
    tagline: "Buys everything the company needs — at the right price, terms, and quality.",
    whatItDoes: [
      "Procurement manages third-party spending: sourcing vendors, negotiating contracts, issuing purchase orders, and managing supplier performance across raw materials, software, services, and equipment.",
      "At scale, procurement savings drop straight to profit: negotiating 10% better on $50M of annual spend equals earnings from selling millions more.",
    ],
    whyItExists: [
      "Unmanaged spend leaks margin everywhere — duplicate tools, auto-renewals, weak terms.",
      "Supplier failures (bankruptcy, quality, delays) halt operations without contingency planning.",
      "Consolidated buying power unlocks discounts fragmented departments never see.",
    ],
    responsibilities: [
      "Sourcing strategy and supplier selection (RFPs, RFQs)",
      "Contract negotiation: price, SLAs, termination rights, liability caps",
      "Purchase order processing and approval workflows",
      "Vendor performance management and scorecards",
      "Spend analysis and consolidation opportunities",
      "Supply-risk monitoring and backup qualification",
    ],
    roles: [
      {
        title: "Head of Procurement / CPO",
        description: "Owns total managed spend and sourcing strategy.",
      },
      {
        title: "Category Manager",
        description: "Specialist per spend domain (software, logistics, marketing…).",
      },
      {
        title: "Buyer",
        description: "Executes transactions and PO management for assigned categories.",
      },
      {
        title: "Vendor Manager",
        description: "Relationship steward tracking performance and renegotiations.",
      },
    ],
    kpis: [
      { name: "Cost savings", description: "Negotiated reductions versus baseline prices." },
      { name: "Spend under management", description: "% of company spend flowing through procurement processes." },
      { name: "Supplier OTIF", description: "On-Time-In-Full delivery performance percentage." },
      { name: "PO cycle time", description: "Days from requisition to issued PO." },
    ],
    terminology: [
      { term: "RFP / RFQ", definition: "Request for Proposal (broad) / Quote (priced) solicitation." },
      { term: "PO (Purchase Order)", definition: "Formal order document authorizing spend contractually." },
      { term: "TCO", definition: "Total Cost of Ownership including hidden lifecycle costs." },
      { term: "Maverick spend", definition: "Purchases bypassing approved vendors/processes." },
      { term: "Category management", definition: "Organizing spend into domains managed strategically." },
    ],
    worksWith: [
      { department: "Finance", how: "Three-way match: PO + receipt + invoice before payment releases." },
      { department: "Operations", how: "Secures material continuity; qualifies alternates for resilience." },
      { department: "IT", how: "Manages SaaS renewals calendar and seat reconciliation." },
      { department: "Legal", how: "Jointly negotiates MSAs, DPAs, and liability terms." },
    ],
    workflow: [
      { step: "Requisition", detail: "Department submits need with justification and budget line." },
      { step: "Source", detail: "Identify 3+ candidates; issue RFQ/RFP; collect bids." },
      { step: "Negotiate", detail: "Compare TCO, not sticker price; squeeze terms and volume tiers." },
      { step: "Order", detail: "Issue PO; confirm delivery dates; log commitments." },
      { step: "Receive & pay", detail: "Match goods receipt to invoice; flag discrepancies; release payment." },
      { step: "Review supplier", detail: "Quarterly scorecards feed renewal and consolidation decisions." },
    ],
  },
];

export const departmentBySlug = (slug: string) =>
  departments.find((d) => d.slug === slug);

export const departmentGroups: Department["group"][] = [
  "Leadership",
  "Business",
  "Technical",
  "People & Support",
];
